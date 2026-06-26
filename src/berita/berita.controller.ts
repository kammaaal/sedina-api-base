import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('berita')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
export class BeritaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @CacheKey('all_berita')
  @CacheTTL(60000)
  async findAll() {
    const berita = await this.prisma.berita.findMany({
      orderBy: { id: 'desc' }
    });

    return { status: true, data: berita };
  }
}
