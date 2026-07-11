import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.newsService.findAll(page, limit);
  }

  @Get('admin')
  @Roles('superadmin', 'setwan')
  async findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.newsService.findAllAdmin(page, limit);
  }

  @Post()
  @Roles('superadmin', 'setwan')
  async create(@Body() createNewsDto: CreateNewsDto, @Req() req: any) {
    // req.user is set by JwtAuthGuard
    const authorId = req.user.sub;
    return this.newsService.create(createNewsDto, authorId);
  }

  @Patch(':id')
  @Roles('superadmin', 'setwan')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @Roles('superadmin', 'setwan')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.remove(id);
  }

  @Patch(':id/view')
  async incrementView(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.incrementView(id);
  }
}
