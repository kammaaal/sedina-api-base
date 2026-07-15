import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const ip = String(req.ip || req.connection?.remoteAddress || '');
    const userAgent = String(req.headers?.['user-agent'] || '');

    try {
      const user = await this.authService.validateUser(loginDto);
      return await this.authService.login(user, loginDto, ip, userAgent);
    } catch (error) {
      await this.authService.recordFailedLogin(loginDto.email, ip, userAgent);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@Request() req: any) {
    return this.authService.getSession(req.user);
  }
}
