import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class LoginHistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) {}

  @Get('login-history')
  async getLoginHistory(@Req() req: { user?: { id: number } }) {
    const userId = Number(req.user?.id);
    const histories = await this.loginHistoryService.getHistories(userId);
    return {
      status: true,
      message: 'Berhasil mengambil riwayat login',
      data: histories,
    };
  }

  @Get('devices')
  async getActiveDevices(@Req() req: { user?: { id: number } }) {
    const userId = Number(req.user?.id);
    const devices = await this.loginHistoryService.getActiveDevices(userId);
    return {
      status: true,
      message: 'Berhasil mengambil daftar perangkat aktif',
      data: devices,
    };
  }

  @Delete('devices/:sessionId')
  async revokeDevice(
    @Req() req: { user?: { id: number } },
    @Param('sessionId') sessionId: string,
  ) {
    const userId = Number(req.user?.id);
    const result = await this.loginHistoryService.revokeDevice(
      userId,
      sessionId,
    );

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
