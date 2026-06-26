import { Module } from '@nestjs/common';
import { BeritaController } from './berita.controller';

@Module({
  controllers: [BeritaController]
})
export class BeritaModule {}
