import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { AgendaFilterDto } from './dto/agenda-filter.dto';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class AgendaService {
  constructor(private prisma: PrismaService) {}

  // Helper method to parse time string (HH:mm) into a full DateTime object for database insertion
  private parseTime(dateString: string, timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date(dateString);
    date.setUTCHours(
      Number(hours) || 0,
      Number(minutes) || 0,
      Number(seconds) || 0,
      0,
    );
    return date;
  }

  async create(dto: CreateAgendaDto) {
    const { targets, ...agendaData } = dto;

    // Parse times
    const waktu_mulai = this.parseTime(dto.tanggal, dto.waktu_mulai);
    const waktu_selesai = this.parseTime(dto.tanggal, dto.waktu_selesai);

    const agenda = await this.prisma.agenda.create({
      data: {
        title: agendaData.judul,
        description: agendaData.deskripsi,
        location: agendaData.lokasi,
        date: new Date(dto.tanggal),
        start_time: waktu_mulai,
        end_time: waktu_selesai,
        type: agendaData.tipe,
        targets: {
          create:
            targets?.map((t) => ({
              target_type: t.target_type,
              target_id: t.target_id,
            })) || [],
        },
      },
      include: { targets: true },
    });

    return agenda;
  }

  async findAll(filter: AgendaFilterDto) {
    const where: Prisma.AgendaWhereInput = {};

    if (filter.startDate && filter.endDate) {
      where.date = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate),
      };
    } else if (filter.startDate) {
      where.date = { gte: new Date(filter.startDate) };
    } else if (filter.endDate) {
      where.date = { lte: new Date(filter.endDate) };
    }

    if (filter.tipe) {
      where.type = filter.tipe;
    }

    if (filter.search) {
      where.title = { contains: filter.search }; // case-insensitive defaults in Prisma vary by DB, but works fine for basic needs
    }

    // Time filtering is a bit tricky with DB.Time in Prisma. We'll fetch and filter if necessary,
    // or we can attempt to filter by extracting hours. For robust time filtering on DateTime DB types:
    if (filter.startTime && filter.endTime) {
      // Since the DB field is DateTime (representing time), we can't easily do raw Prisma between on just time portion without raw queries.
      // However, we can construct generic 1970-01-01 times for comparison if Prisma supports it,
      // Or we can retrieve data and filter in memory if the dataset isn't huge.
      // For this implementation, we will use Prisma raw or keep it simple. Let's do memory filter for the time if provided to ensure accuracy.
    }

    const agendas = await this.prisma.agenda.findMany({
      where,
      include: { targets: true },
      orderBy: [{ date: 'desc' }, { start_time: 'desc' }],
    });

    // Memory filter for strict time range since time-only comparison in some SQL DBs through Prisma DateTime mapping is tricky
    if (filter.startTime && filter.endTime) {
      return agendas.filter((a) => {
        // use UTC format to avoid timezone shift against saved UTC time
        const itemStartTime = dayjs(a.start_time).utc().format('HH:mm');
        const itemEndTime = dayjs(a.end_time).utc().format('HH:mm');
        return (
          itemStartTime >= filter.startTime! && itemEndTime <= filter.endTime!
        );
      });
    }

    return agendas;
  }

  async findOne(id: number) {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id },
      include: { targets: true },
    });

    if (!agenda) {
      throw new NotFoundException('Agenda tidak ditemukan');
    }
    return agenda;
  }

  async getAgendaUser(userId: number) {
    // 1. Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { akds: true },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');

    // 2. Determine user's targets
    const targetConditions: any[] = [];

    if (user.fraksi_id) {
      targetConditions.push({
        target_type: 'fraksi',
        target_id: user.fraksi_id,
      });
    }
    if (user.komisi_id) {
      targetConditions.push({
        target_type: 'komisi',
        target_id: user.komisi_id,
      });
    }
    if (user.akds && user.akds.length > 0) {
      for (const ua of user.akds) {
        targetConditions.push({ target_type: 'akd', target_id: ua.akd_id });
      }
    }

    // Include global agendas (e.g. no targets or specific type like 'Paripurna') if required,
    // For now we filter based on explicit targets

    // Jika tidak memiliki afiliasi target sama sekali, kembalikan array kosong
    // sehingga user tidak bisa melihat agenda komisi/fraksi/akd manapun.
    if (targetConditions.length === 0) {
      return [];
    }

    const whereClause: Prisma.AgendaWhereInput = {
      targets: { some: { OR: targetConditions } },
    };

    return this.prisma.agenda.findMany({
      where: whereClause,
      include: { targets: true },
      orderBy: [{ date: 'desc' }, { start_time: 'desc' }],
    });
  }

  async getAgendaBersamaan(date: string) {
    // Cari semua agenda pada tanggal tertentu
    const agendas = await this.prisma.agenda.findMany({
      where: { date: new Date(date) },
      include: { targets: true },
      orderBy: { start_time: 'asc' },
    });

    // Cari overlap
    const bersamaan: any[] = [];
    for (let i = 0; i < agendas.length; i++) {
      for (let j = i + 1; j < agendas.length; j++) {
        const startA = agendas[i].start_time.getTime();
        const endA = agendas[i].end_time.getTime();
        const startB = agendas[j].start_time.getTime();
        const endB = agendas[j].end_time.getTime();

        // Logic Overlap: Max(startA, startB) < Min(endA, endB)
        if (Math.max(startA, startB) < Math.min(endA, endB)) {
          if (!bersamaan.includes(agendas[i])) bersamaan.push(agendas[i]);
          if (!bersamaan.includes(agendas[j])) bersamaan.push(agendas[j]);
        }
      }
    }

    return [...new Set(bersamaan)]; // Return unique agendas
  }

  async update(id: number, dto: CreateAgendaDto) {
    // Cek eksistensi
    await this.findOne(id);

    const { targets, ...agendaData } = dto;
    const waktu_mulai = this.parseTime(dto.tanggal, dto.waktu_mulai);
    const waktu_selesai = this.parseTime(dto.tanggal, dto.waktu_selesai);

    // Update agenda dan targets (hapus yang lama, buat yang baru)
    return this.prisma.agenda.update({
      where: { id },
      data: {
        title: agendaData.judul,
        description: agendaData.deskripsi,
        location: agendaData.lokasi,
        date: new Date(dto.tanggal),
        start_time: waktu_mulai,
        end_time: waktu_selesai,
        type: agendaData.tipe,
        targets: {
          deleteMany: {}, // hapus target lama
          create:
            targets?.map((t) => ({
              target_type: t.target_type,
              target_id: t.target_id,
            })) || [],
        },
      },
      include: { targets: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // pastikan ada
    await this.prisma.agenda.delete({
      where: { id },
    });
    return { message: 'Agenda berhasil dihapus' };
  }
}
