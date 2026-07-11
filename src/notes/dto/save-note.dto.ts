import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveNoteDto {
  @IsNotEmpty()
  @IsNumber()
  agenda_id: number;

  @IsNotEmpty()
  @IsString()
  note: string;
}
