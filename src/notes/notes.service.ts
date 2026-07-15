import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './repository/notes.repository';
import { SaveNoteDto } from './dto/save-note.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getNote(agendaId: number, userId: number) {
    // Validate that the agenda exists
    const agenda = await this.prisma.agenda.findUnique({
      where: { id: agendaId },
    });

    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${agendaId} not found`);
    }

    const note = await this.notesRepository.getNoteByAgendaAndUser(
      agendaId,
      userId,
    );
    return note;
  }

  async saveNote(saveNoteDto: SaveNoteDto, userId: number) {
    // Validate that the agenda exists
    const agenda = await this.prisma.agenda.findUnique({
      where: { id: saveNoteDto.agenda_id },
    });

    if (!agenda) {
      throw new NotFoundException(
        `Agenda with ID ${saveNoteDto.agenda_id} not found`,
      );
    }

    return this.notesRepository.upsertNote(
      saveNoteDto.agenda_id,
      userId,
      saveNoteDto.note,
    );
  }
}
