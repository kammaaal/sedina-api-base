import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.sessionId) {
      // 1. Check Redis Cache
      const cacheStatus = await this.cacheManager.get<string>(
        `session:${user.sessionId}`,
      );

      if (cacheStatus === 'revoked') {
        throw new UnauthorizedException('Sesi telah dicabut');
      }

      // 2. Fallback to DB if not found in Cache
      if (!cacheStatus) {
        const session = await this.prisma.userSession.findUnique({
          where: { sessionId: user.sessionId },
        });

        if (!session || session.isRevoked) {
          // Sync to cache as revoked
          await this.cacheManager.set(
            `session:${user.sessionId}`,
            'revoked',
            86400000,
          );
          throw new UnauthorizedException(
            'Sesi telah kedaluwarsa atau dicabut',
          );
        }

        // Sync to cache as active
        await this.cacheManager.set(
          `session:${user.sessionId}`,
          'active',
          86400000,
        );
      }
    }

    return true;
  }
}
