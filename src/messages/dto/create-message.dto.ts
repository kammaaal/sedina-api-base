import { IsNotEmpty, IsString, IsIn, ValidateIf } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['user', 'all', 'komisi', 'fraksi', 'akd', 'role'])
  target_type: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @ValidateIf((o: any) => o.target_type !== 'all')
  @IsNotEmpty()
  @IsString()
  target_id?: string;
}
