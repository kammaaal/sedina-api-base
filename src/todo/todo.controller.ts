import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getTodos(@Req() req: any) {
    const userId = req.user.id;
    return this.todoService.getTodosByUser(userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('attachment'))
  async createTodo(
    @Req() req: any,
    @Body() createTodoDto: CreateTodoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.todoService.createTodo(userId, createTodoDto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('attachment'))
  async updateTodo(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.todoService.updateTodo(+id, userId, updateTodoDto, file);
  }

  @Patch(':id/status')
  async updateTodoStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateTodoStatusDto: UpdateTodoStatusDto,
  ) {
    const userId = req.user.id;
    return this.todoService.updateTodoStatus(
      +id,
      userId,
      updateTodoStatusDto.status,
    );
  }

  @Delete(':id')
  async deleteTodo(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.todoService.deleteTodo(+id, userId);
  }
}
