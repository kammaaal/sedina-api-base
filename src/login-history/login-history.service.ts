import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as maxmind from 'maxmind';
import * as path from 'path';

@Injectable()
export class LoginHistoryService {
  private readonly logger = new Logger(LoginHistoryService.name);

  constructor(private prisma: PrismaService) {}

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
    status: string;
    sessionId?: string;
  }) {
    const location = await this.getLocationFromIp(data.ipAddress);

    return this.prisma.loginHistory.create({
      data: {
        userId: data.userId,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
        sessionId: data.sessionId,
        location,
      },
    });
  }

  async getHistories(userId: number) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
    });
  }

  async getActiveDevices(userId: number) {
    return this.prisma.loginHistory.findMany({
      where: {
        userId,
        status: 'SUCCESS',
        isRevoked: false,
      },
      orderBy: { loginTime: 'desc' },
    });
  }

  async revokeDevice(userId: number, sessionId: string) {
    // Check if the session belongs to the user and is active
    const session = await this.prisma.loginHistory.findUnique({
      where: { sessionId },
    });

    if (!session || session.userId !== userId) {
      return null;
    }

    return this.prisma.loginHistory.update({
      where: { sessionId },
      data: { isRevoked: true },
    });
  }
}
