import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('anggota')
  @Roles('superadmin', 'setwan')
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          nama_role: { notIn: ['superadmin', 'setwan'] },
        },
      },
      include: {
        jabatan: true,
        fraksi: true,
        komisi: true,
        akds: {
          include: { akd: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    const data = users.map((user) => ({
      id: user.id,
      nama: user.nama,
      email: user.email,
      foto: user.foto,
      jabatan: user.jabatan?.nama_jabatan || null,
      fraksi: user.fraksi?.nama_fraksi || null,
      komisi: user.komisi?.nama_komisi || null,
      akd: user.akds.map((ua) => ua.akd.nama_akd).join(', '),
    }));

    return { status: true, data };
  }

  @Get('profile')
  async getProfile(@Request() req: any) {
    const data = await this.usersService.getProfile(req.user.sub);
    return { status: true, data };
  }

  @Put('password')
  async updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    const result = await this.usersService.updatePassword(req.user.sub, dto);
    return { status: true, message: result.message };
  }

  @Get('master-anggota')
  async getMasterAnggota() {
    const cacheKey = 'master_anggota';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return { status: true, ...(cachedData as Record<string, any>) };
    }

    const data = await this.usersService.getMasterAnggota();
    await this.cacheManager.set(cacheKey, data, 3600000); // cache for 1 hour

    return { status: true, ...data };
  }

  @Post('anggota')
  @Roles('superadmin', 'setwan')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/anggota', // Asumsi direktori ini akan dibuat atau ada konfigurasi khusus
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createAnggota(@Body() dto: CreateAnggotaDto, @UploadedFile() file: any) {
    const result = await this.usersService.createAnggota(dto, file);
    return { status: true, message: result.message };
  }
}
