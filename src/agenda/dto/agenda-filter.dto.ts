import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class AgendaFilterDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'startTime must be a valid time (HH:mm)',
  })
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'endTime must be a valid time (HH:mm)',
  })
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  tipe?: string;

  @IsString()
  @IsOptional()
  search?: string; // Untuk pencarian judul agenda
}
