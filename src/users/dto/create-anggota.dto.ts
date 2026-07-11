import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnggotaDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  nama: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  jabatan_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  komisi_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fraksi_id?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  akd_id?: number;
}
