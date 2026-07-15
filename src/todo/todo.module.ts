import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoRepository } from './todo.repository';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/todo',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '_' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [TodoController],
  providers: [TodoService, TodoRepository],
})
export class TodoModule {}
