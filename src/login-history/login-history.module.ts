import { Module } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryController } from './login-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LoginHistoryService],
  controllers: [LoginHistoryController],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule {}
