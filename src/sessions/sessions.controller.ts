import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('login-history')
  async getSessions(@Req() req: { user?: { id: number } }) {
    const userId = Number(req.user?.id);
    const histories = await this.sessionsService.getHistories(userId);
    const formattedHistories = histories.map((h) => ({
      ...h,
      location: h.location ? JSON.parse(h.location) : null,
    }));
    return {
      status: true,
      message: 'Berhasil mengambil riwayat login',
      data: formattedHistories,
    };
  }

  @Get('devices')
  async getActiveDevices(@Req() req: { user?: { id: number } }) {
    const userId = Number(req.user?.id);
    const devices = await this.sessionsService.getActiveDevices(userId);
    const formattedDevices = devices.map((d) => ({
      ...d,
      location: d.location ? JSON.parse(d.location) : null,
    }));
    return {
      status: true,
      message: 'Berhasil mengambil daftar perangkat aktif',
      data: formattedDevices,
    };
  }

  @Delete('devices/:sessionId')
  async revokeDevice(
    @Req() req: { user?: { id: number } },
    @Param('sessionId') sessionId: string,
  ) {
    const userId = Number(req.user?.id);
    const result = await this.sessionsService.revokeDevice(userId, sessionId);

    if (!result) {
      throw new NotFoundException('Sesi tidak ditemukan atau bukan milik Anda');
    }

    return {
      status: true,
      message: 'Berhasil mencabut akses perangkat',
      data: result,
    };
  }
}
