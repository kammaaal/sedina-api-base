import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('superadmin', 'setwan')
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          nama_role: { notIn: ['superadmin', 'setwan'] }
        }
      },
      include: {
        jabatan: true,
        fraksi: true,
        komisi: true,
        akds: {
          include: { akd: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    const data = users.map(user => ({
      id: user.id,
      nama: user.nama,
      email: user.email,
      foto: user.foto,
      jabatan: user.jabatan?.nama_jabatan || null,
      fraksi: user.fraksi?.nama_fraksi || null,
      komisi: user.komisi?.nama_komisi || null,
      akd: user.akds.map(ua => ua.akd.nama_akd).join(', ')
    }));

    return { status: true, data };
  }
}
