import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(clockInDto: ClockInDto) {
    const existing = await this.prisma.attendance.findUnique({
      where: {
        agenda_id_user_id: {
          agenda_id: clockInDto.agenda_id,
          user_id: clockInDto.user_id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already clocked in');
    }

    const folder = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const imageBuffer = Buffer.from(clockInDto.photo, 'base64');
    const fileName = `clockin_${Date.now()}.jpg`;
    const filePath = path.join(folder, fileName);

    fs.writeFileSync(filePath, imageBuffer);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const record = await this.prisma.attendance.create({
      data: {
        agenda_id: clockInDto.agenda_id,
        user_id: clockInDto.user_id,
        date: new Date(dateStr),
        time: new Date(`1970-01-01T${now.toISOString().split('T')[1]}`),
        location: clockInDto.location,
        photo: `uploads/${fileName}`,
      },
    });

    return {
      status: true,
      message: 'Successfully clocked in',
      date: dateStr,
      time: now.toISOString().split('T')[1].substring(0, 8),
      location: clockInDto.location,
      photo_url: `http://localhost:3000/uploads/${fileName}`, // Consider using dynamic host or env
    };
  }

  async getStatus(agenda_id: number, user_id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        agenda_id_user_id: {
          agenda_id: agenda_id,
          user_id: user_id,
        },
      },
    });

    return {
      already_clocked_in: !!attendance,
      data: attendance || null,
    };
  }

  async getHistory(user_id: number) {
    if (!user_id || user_id === 0) {
      return {
        status: false,
        message: 'user_id is empty or invalid',
      };
    }

    const history = await this.prisma.attendance.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        agenda: {
          select: {
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      status: true,
      data: history,
    };
  }
}
