import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService) {
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
      const session = await this.prisma.loginHistory.findUnique({
        where: { sessionId: user.sessionId },
      });

      if (!session || session.isRevoked) {
        throw new UnauthorizedException('Sesi telah kedaluwarsa atau dicabut');
      }
    }

    return true;
  }
}
