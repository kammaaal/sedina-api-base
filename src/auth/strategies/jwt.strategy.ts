import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    // Check if user exists (we do not necessarily check device_id here for every request
    // unless required, but the prompt says to check it in getSession).
    // However, to make the payload fields accessible in the request user object, we pass them through.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      // Include payload device_id and browser_agent so getSession can verify them
      device_id_from_payload: payload.device_id,
      browser_agent_from_payload: payload.browser_agent,
    };
  }
}
