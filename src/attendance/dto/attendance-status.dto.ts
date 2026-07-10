import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AttendanceStatusDto {
  @IsNumber()
  @IsNotEmpty()
  agenda_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
