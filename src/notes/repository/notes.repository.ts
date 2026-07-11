import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNoteByAgendaAndUser(agendaId: number, userId: number) {
    return this.prisma.agendaNote.findUnique({
      where: {
        agenda_id_user_id: {
          agenda_id: agendaId,
          user_id: userId,
        },
      },
    });
  }

  async upsertNote(agendaId: number, userId: number, noteText: string) {
    return this.prisma.agendaNote.upsert({
      where: {
        agenda_id_user_id: {
          agenda_id: agendaId,
          user_id: userId,
        },
      },
      update: {
        note: noteText,
      },
      create: {
        agenda_id: agendaId,
        user_id: userId,
        note: noteText,
      },
    });
  }
}
