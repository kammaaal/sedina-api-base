import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    const data = await this.prisma.news.findMany({
      where: {
        status_code: 2, // Published
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });

    const total = await this.prisma.news.count({
      where: { status_code: 2 },
    });

    return {
      status: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const data = await this.prisma.news.findMany({
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });

    const total = await this.prisma.news.count();

    return {
      status: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createNewsDto: CreateNewsDto, authorId: number) {
    const { tags, ...newsData } = createNewsDto;

    const news = await this.prisma.news.create({
      data: {
        ...newsData,
        author_id: authorId,
        tags: tags
          ? {
              connect: tags.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return {
      status: true,
      message: 'News created successfully',
      data: news,
    };
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    const { tags, ...newsData } = updateNewsDto;

    const news = await this.prisma.news.update({
      where: { id },
      data: {
        ...newsData,
        tags: tags
          ? {
              set: tags.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return {
      status: true,
      message: 'News updated successfully',
      data: news,
    };
  }

  async remove(id: number) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    await this.prisma.news.delete({ where: { id } });

    return {
      status: true,
      message: 'News deleted successfully',
    };
  }

  async incrementView(id: number) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    await this.prisma.news.update({
      where: { id },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    return { status: true };
  }
}
