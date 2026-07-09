import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ClockInDto {
  @IsNumber()
  @IsNotEmpty()
  agenda_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  photo: string; // Base64 encoded string
}
