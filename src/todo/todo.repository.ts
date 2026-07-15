import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TodoListUncheckedCreateInput) {
    return this.prisma.todoList.create({
      data,
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.todoList.findMany({
      where: { user_id: userId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findById(id: number) {
    return this.prisma.todoList.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.TodoListUncheckedUpdateInput) {
    return this.prisma.todoList.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: number, status: boolean) {
    return this.prisma.todoList.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: number) {
    return this.prisma.todoList.delete({
      where: { id },
    });
  }
}
