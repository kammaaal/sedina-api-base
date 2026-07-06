import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private encryptData(data: any): string {
    // ENCRYPTION_KEY must be exactly 32 bytes for aes-256-cbc.
    // If not set, use a fallback string (for development) and hash it to ensure 32 bytes.
    const secretKeyStr =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      'default-secret-key-that-should-be-changed';
    const key = crypto
      .createHash('sha256')
      .update(String(secretKeyStr))
      .digest('base64')
      .substring(0, 32);

    // Generate a random 16-byte initialization vector
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return iv and encrypted data concatenated, so FE can extract IV and decrypt.
    return iv.toString('hex') + ':' + encrypted;
  }

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

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Email atau password salah');
  }

  async login(user: any, loginDto: LoginDto) {
    // Update user device_id and browser_agent
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        device_id: loginDto.device_id ?? null,
        browser_agent: loginDto.browser_agent ?? null,
      },
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.nama_role ?? user.role_id,
      device_id: loginDto.device_id ?? null,
      browser_agent: loginDto.browser_agent ?? null,
    };

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
      },
    };
  }

  async getSession(userFromReq: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userFromReq.id },
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

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Check device_id and browser_agent to ensure session hasn't been hijacked or expired
    if (
      userFromReq.device_id_from_payload &&
      user.device_id !== userFromReq.device_id_from_payload
    ) {
      throw new UnauthorizedException(
        'Session expired atau login di perangkat lain',
      );
    }
    if (
      userFromReq.browser_agent_from_payload &&
      user.browser_agent !== userFromReq.browser_agent_from_payload
    ) {
      throw new UnauthorizedException(
        'Session expired atau login di browser lain',
      );
    }

    const userData = {
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
    };

    const encryptedData = this.encryptData(userData);

    return {
      status: true,
      data: encryptedData,
    };
  }
}
