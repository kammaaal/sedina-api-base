import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnggotaDto } from './dto/create-anggota.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        jabatan: true,
        fraksi: true,
        komisi: true,
        akds: {
          include: { akd: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      name: user.name,
      email: user.email,
      photo: user.photo,
      role_id: user.role_id,
      fraksi_id: user.fraksi_id,
      komisi_id: user.komisi_id,
      jabatan_id: user.jabatan_id,
      jabatan: user.jabatan?.jabatan_name || '-',
      fraksi: user.fraksi?.fraksi_name || '-',
      komisi: user.komisi?.komisi_name || '-',
      akd: user.akds.map((ua) => ua.akd.akd_name),
      panja: [], // placeholder if relations are added later
      pansus: [], // placeholder if relations are added later
    };
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.old_password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password lama salah');
    }

    const hashedPassword = await bcrypt.hash(dto.new_password, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  async getMasterAnggota() {
    const [jabatan, komisi, fraksi, akd] = await Promise.all([
      this.prisma.jabatan.findMany({ orderBy: { jabatan_name: 'asc' } }),
      this.prisma.komisi.findMany({ orderBy: { komisi_name: 'asc' } }),
      this.prisma.fraksi.findMany({ orderBy: { fraksi_name: 'asc' } }),
      this.prisma.akd.findMany({ orderBy: { akd_name: 'asc' } }),
    ]);

    return {
      jabatan,
      komisi,
      fraksi,
      akd,
    };
  }

  async createAnggota(dto: CreateAnggotaDto, file?: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah digunakan');
    }

    const role = await this.prisma.role.findFirst({
      where: { role_name: 'Anggota Dewan (Anggota)' },
    });

    if (!role) {
      throw new BadRequestException('Role Anggota tidak ditemukan di database');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const fotoPath = file ? file.filename : null; // Asumsi menggunakan disk storage atau cloud storage

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.nama,
        email: dto.email,
        password: hashedPassword,
        photo: fotoPath,
        role_id: role.id,
        jabatan_id: dto.jabatan_id,
        komisi_id: dto.komisi_id,
        fraksi_id: dto.fraksi_id,
      },
    });

    if (dto.akd_id) {
      await this.prisma.userAkd.create({
        data: {
          user_id: newUser.id,
          akd_id: dto.akd_id,
        },
      });
    }

    return { message: 'Berhasil menambahkan anggota' };
  }
}
