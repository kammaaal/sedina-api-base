import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { SaveNoteDto } from './dto/save-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('agenda/:agendaId')
  async getNote(
    @Param('agendaId', ParseIntPipe) agendaId: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const note = await this.notesService.getNote(agendaId, userId);
    return {
      status: 'success',
      data: note,
    };
  }

  @Post()
  async saveNote(@Body() saveNoteDto: SaveNoteDto, @Req() req: any) {
    const userId = req.user.id;
    const note = await this.notesService.saveNote(saveNoteDto, userId);
    return {
      status: 'success',
      message: 'Note saved successfully',
      data: note,
    };
  }
}
