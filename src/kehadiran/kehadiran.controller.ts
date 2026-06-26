import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ClockinDto } from './dto/clockin.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('kehadiran')
@UseGuards(JwtAuthGuard)
export class KehadiranController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('clockin')
  async clockin(@Body() clockinDto: ClockinDto) {
    const existing = await this.prisma.kehadiran.findUnique({
      where: {
        agenda_id_user_id: {
          agenda_id: clockinDto.agenda_id,
          user_id: clockinDto.user_id,
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Sudah clock-in');
    }

    const folder = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const imageBuffer = Buffer.from(clockinDto.foto, 'base64');
    const fileName = `clockin_${Date.now()}.jpg`;
    const filePath = path.join(folder, fileName);

    fs.writeFileSync(filePath, imageBuffer);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // MySQL Date and Time fields need special handling in Prisma.
    // However, since we defined them as DateTime in Prisma schema:
    const record = await this.prisma.kehadiran.create({
      data: {
        agenda_id: clockinDto.agenda_id,
        user_id: clockinDto.user_id,
        tanggal: new Date(dateStr),
        jam: new Date(`1970-01-01T${now.toISOString().split('T')[1]}`),
        lokasi: clockinDto.lokasi,
        foto: `uploads/${fileName}`
      }
    });

    return {
      status: true,
      message: 'Berhasil clock-in',
      tanggal: dateStr,
      jam: now.toISOString().split('T')[1].substring(0,8),
      lokasi: clockinDto.lokasi,
      foto_url: `http://localhost:3000/uploads/${fileName}`
    };
  }
}
