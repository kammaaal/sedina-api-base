import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import * as maxmind from 'maxmind';
import * as path from 'path';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getLocationFromIp(ip: string): Promise<string | null> {
    try {
      // In dev environments like localhost, IP might be ::1 or 127.0.0.1
      if (ip === '::1' || ip === '127.0.0.1') {
        return 'Localhost';
      }

      // We resolve the maxmind db from geolite2-redist
      const dbPath = path.join(
        process.cwd(),
        'node_modules',
        'geolite2-redist',
        'GeoLite2-City.mmdb',
      );

      const lookup = await maxmind.open(dbPath);
      const result = lookup.get(ip);

      if (result && typeof result === 'object') {
        const anyResult = result as Record<
          string,
          Record<string, Record<string, string>>
        >;
        const city = String(anyResult.city?.names?.en || '');
        const country = String(anyResult.country?.names?.en || '');
        if (city && country) return `${city}, ${country}`;
        if (country) return country;
        if (city) return city;
      }
      return 'Unknown Location';
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(
        `Error looking up IP location for ${ip}: ${err.message}`,
      );
      return 'Unknown Location';
    }
  }

  async createHistory(data: {
    userId?: number;
    email: string;
    ipAddress: string;
    userAgent: string;
    deviceName?: string;
    status: string;
    sessionId?: string;
    expiresAt?: Date;
  }) {
    let locationString: string | null = null;
    try {
      if (data.ipAddress === '::1' || data.ipAddress === '127.0.0.1') {
        locationString = JSON.stringify({
          city: 'Localhost',
          country: 'Localhost',
          latitude: 0,
          longitude: 0,
        });
      } else {
        const dbPath = path.join(
          process.cwd(),
          'node_modules',
          'geolite2-redist',
          'GeoLite2-City.mmdb',
        );
        const lookup = await maxmind.open(dbPath);
        const result = lookup.get(data.ipAddress);
        if (result && typeof result === 'object') {
          const anyResult = result as Record<string, any>;
          locationString = JSON.stringify({
            city: anyResult.city?.names?.en || '',
            country: anyResult.country?.iso_code || '',
            latitude: anyResult.location?.latitude || null,
            longitude: anyResult.location?.longitude || null,
          });
        }
      }
    } catch (e) {
      this.logger.error('Location error', e);
    }

    const session = await this.prisma.userSession.create({
      data: {
        userId: data.userId,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceName: data.deviceName,
        status: data.status,
        sessionId: data.sessionId,
        location: locationString,
        expiresAt: data.expiresAt,
      },
    });

    if (data.status === 'SUCCESS' && data.sessionId) {
      await this.cacheManager.set(
        `session:${data.sessionId}`,
        'active',
        86400000,
      ); // 1 day in ms
    }

    return session;
  }

  async getHistories(userId: number) {
    return this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });
  }

  async getActiveDevices(userId: number) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        status: 'SUCCESS',
        isRevoked: false,
      },
      orderBy: { loginAt: 'desc' },
    });
  }

  async revokeDevice(userId: number, sessionId: string) {
    // Check if the session belongs to the user and is active
    const session = await this.prisma.userSession.findUnique({
      where: { sessionId },
    });

    if (!session || session.userId !== userId) {
      return null;
    }

    const updatedSession = await this.prisma.userSession.update({
      where: { sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    // Mark as revoked in Redis
    await this.cacheManager.set(`session:${sessionId}`, 'revoked', 86400000);

    return updatedSession;
  }
}
