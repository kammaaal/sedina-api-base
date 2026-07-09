import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { AgendaFilterDto } from './dto/agenda-filter.dto';

@Controller('agenda')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgendaController {
  constructor(
    private readonly agendaService: AgendaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @Roles('superadmin', 'setwan')
  async create(@Body() createAgendaDto: CreateAgendaDto) {
    const data = await this.agendaService.create(createAgendaDto);
    return { status: true, message: 'Agenda berhasil dibuat', data };
  }

  @Get()
  async findAll(@Query() filter: AgendaFilterDto) {
    // Basic caching for list without complex filters
    const isFilterEmpty = Object.keys(filter).length === 0;
    const cacheKey = 'all_agenda_list';

    if (isFilterEmpty) {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        return { status: true, ...(cachedData as Record<string, any>) };
      }
    }

    const data = await this.agendaService.findAll(filter);

    if (isFilterEmpty) {
      // cache for 60 seconds (60000 ms)
      await this.cacheManager.set(cacheKey, { data }, 60000);
    }

    return { status: true, data };
  }

  @Get('user')
  async getAgendaUser(@Request() req: any) {
    const userId = req.user.sub; // From JWT payload
    const data = await this.agendaService.getAgendaUser(userId);
    return { status: true, data };
  }

  @Get('bersamaan')
  async getAgendaBersamaan(@Query('tanggal') tanggal: string) {
    if (!tanggal) {
      return { status: false, message: 'Parameter tanggal diperlukan (YYYY-MM-DD)' };
    }
    const data = await this.agendaService.getAgendaBersamaan(tanggal);
    return { status: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.agendaService.findOne(+id);
    return { status: true, data };
  }

  @Put(':id')
  @Roles('superadmin', 'setwan')
  async update(@Param('id') id: string, @Body() updateAgendaDto: CreateAgendaDto) {
    const data = await this.agendaService.update(+id, updateAgendaDto);
    return { status: true, message: 'Agenda berhasil diubah', data };
  }

  @Delete(':id')
  @Roles('superadmin', 'setwan')
  async remove(@Param('id') id: string) {
    const result = await this.agendaService.remove(+id);
    return { status: true, ...result };
  }
}
