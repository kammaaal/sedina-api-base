import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsInt()
  status_code?: number;

  @IsOptional()
  @IsString()
  status_label?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tags?: number[];
}
