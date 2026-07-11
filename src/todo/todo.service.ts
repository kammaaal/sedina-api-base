import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TodoRepository } from './todo.repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TodoService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async getTodosByUser(userId: number) {
    const todos = await this.todoRepository.findAllByUserId(userId);
    return {
      status: true,
      data: todos.map(todo => ({
        ...todo,
        attachment: todo.attachment
          ? `${process.env.APP_URL || 'http://localhost:3000'}/uploads/todo/${todo.attachment}`
          : '',
      })),
    };
  }

  async createTodo(userId: number, createTodoDto: CreateTodoDto, file?: Express.Multer.File) {
    const dateStr = createTodoDto.date.split('T')[0];
    const timeParts = createTodoDto.time.split(':');
    const hours = timeParts[0] || '00';
    const minutes = timeParts[1] || '00';
    const seconds = timeParts[2] || '00';

    const timeDate = new Date(`${dateStr}T${hours}:${minutes}:${seconds}Z`);

    const data = {
      user_id: userId,
      title: createTodoDto.title,
      task_detail: createTodoDto.task_detail,
      note: createTodoDto.note,
      date: new Date(createTodoDto.date),
      time: timeDate,
      location: createTodoDto.location,
      priority: createTodoDto.priority || 'low',
      attachment: file ? file.filename : null,
    };

    await this.todoRepository.create(data);

    return {
      status: true,
      message: 'Todo created successfully',
    };
  }

  async updateTodo(id: number, userId: number, updateTodoDto: UpdateTodoDto, file?: Express.Multer.File) {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.user_id !== userId) {
      throw new UnauthorizedException('You do not have permission to update this todo');
    }

    const data: any = {};
    if (updateTodoDto.title) data.title = updateTodoDto.title;
    if (updateTodoDto.task_detail) data.task_detail = updateTodoDto.task_detail;
    if (updateTodoDto.note) data.note = updateTodoDto.note;
    if (updateTodoDto.date) data.date = new Date(updateTodoDto.date);

    if (updateTodoDto.time) {
      const dateStr = updateTodoDto.date ? updateTodoDto.date.split('T')[0] : todo.date.toISOString().split('T')[0];
      const timeParts = updateTodoDto.time.split(':');
      const hours = timeParts[0] || '00';
      const minutes = timeParts[1] || '00';
      const seconds = timeParts[2] || '00';
      data.time = new Date(`${dateStr}T${hours}:${minutes}:${seconds}Z`);
    }

    if (updateTodoDto.location) data.location = updateTodoDto.location;
    if (updateTodoDto.priority) data.priority = updateTodoDto.priority;

    if (file) {
      data.attachment = file.filename;
      // remove old attachment
      if (todo.attachment) {
        this.deleteFile(todo.attachment);
      }
    }

    await this.todoRepository.update(id, data);

    return {
      status: true,
      message: 'Todo updated successfully',
    };
  }

  async updateTodoStatus(id: number, userId: number, status: boolean) {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.user_id !== userId) {
      throw new UnauthorizedException('You do not have permission to update this todo');
    }

    await this.todoRepository.updateStatus(id, status);

    return {
      status: true,
      message: 'Status updated successfully',
    };
  }

  async deleteTodo(id: number, userId: number) {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.user_id !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this todo');
    }

    if (todo.attachment) {
      this.deleteFile(todo.attachment);
    }

    await this.todoRepository.delete(id);

    return {
      status: true,
      message: 'Todo deleted successfully',
    };
  }

  private deleteFile(filename: string) {
    try {
      const filePath = path.join(__dirname, '..', '..', 'uploads', 'todo', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Failed to delete old attachment:', err);
    }
  }
}
