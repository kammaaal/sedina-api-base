import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('agenda')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
export class AgendaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @CacheKey('all_agenda')
  @CacheTTL(60000) // Cache for 60 seconds
  async findAll() {
    const agendas = await this.prisma.agenda.findMany({
      include: {
        targets: true
      },
      orderBy: [
        { tanggal: 'desc' },
        { waktu_mulai: 'desc' }
      ]
    });

    return { status: true, data: agendas };
  }
}
