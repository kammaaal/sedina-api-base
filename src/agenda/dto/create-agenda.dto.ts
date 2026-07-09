import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AgendaTargetDto {
  @IsString()
  @IsNotEmpty()
  target_type: string; // e.g., 'komisi', 'fraksi', 'akd'

  @IsInt()
  @IsNotEmpty()
  target_id: number;
}

export class CreateAgendaDto {
  @IsString()
  @IsNotEmpty()
  judul: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsString()
  @IsOptional()
  lokasi?: string;

  @IsDateString()
  @IsNotEmpty()
  tanggal: string;

  // Expect HH:mm format, adding :ss optionally
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'waktu_mulai must be a valid time (HH:mm or HH:mm:ss)',
  })
  @IsNotEmpty()
  waktu_mulai: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'waktu_selesai must be a valid time (HH:mm or HH:mm:ss)',
  })
  @IsNotEmpty()
  waktu_selesai: string;

  @IsString()
  @IsOptional()
  tipe?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AgendaTargetDto)
  targets?: AgendaTargetDto[];
}
