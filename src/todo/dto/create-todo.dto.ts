import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  task_detail?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string; // Will be parsed to Date by Prisma

  @IsNotEmpty()
  @IsString()
  time: string; // Time string like "14:30" or "14:30:00"

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
