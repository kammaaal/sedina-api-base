import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ClockinDto {
  @IsNumber()
  @IsNotEmpty()
  agenda_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  lokasi: string;

  @IsString()
  @IsNotEmpty()
  foto: string; // Base64 encoded string
}
