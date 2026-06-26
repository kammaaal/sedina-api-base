import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role: true,
        jabatan: true,
        fraksi: true,
        komisi: true,
        akds: {
          include: { akd: true },
        },
      },
    });

    if (user && await bcrypt.compare(loginDto.password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Email atau password salah');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role.nama_role };
    return {
      status: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        foto: user.foto,
        role: user.role?.nama_role ?? '',
        role_id: user.role_id,
        jabatan: user.jabatan?.nama_jabatan ?? '',
        jabatan_id: user.jabatan_id ?? 0,
        fraksi: user.fraksi?.nama_fraksi ?? '',
        fraksi_id: user.fraksi_id ?? 0,
        komisi: user.komisi?.nama_komisi ?? '',
        komisi_id: user.komisi_id ?? 0,
        akd: user.akds.map((ua: any) => ua.akd.nama_akd),
        access_token: this.jwtService.sign(payload),
      }
    };
  }
}
