import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clockin')
  async clockIn(@Body() clockInDto: ClockInDto) {
    return this.attendanceService.clockIn(clockInDto);
  }

  @Get('status')
  async getStatus(
    @Query('agenda_id') agenda_id: string,
    @Query('user_id') user_id: string,
  ) {
    return this.attendanceService.getStatus(Number(agenda_id), Number(user_id));
  }

  @Get('history')
  async getHistory(@Query('user_id') user_id: string) {
    return this.attendanceService.getHistory(Number(user_id));
  }
}
