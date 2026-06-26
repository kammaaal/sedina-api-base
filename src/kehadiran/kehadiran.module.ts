import { Module } from '@nestjs/common';
import { KehadiranController } from './kehadiran.controller';

@Module({
  controllers: [KehadiranController]
})
export class KehadiranModule {}
