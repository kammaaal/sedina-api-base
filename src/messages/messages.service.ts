import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: number, roleName: string, dto: CreateMessageDto) {
    if (roleName === 'Anggota Dewan (Anggota)') {
      if (dto.target_type !== 'user') {
        throw new ForbiddenException(
          'Anggota can only send direct messages to other users.',
        );
      }
    }

    if (dto.target_type === 'user') {
      if (!dto.target_id) {
        throw new ForbiddenException(
          'target_id is required for direct messages.',
        );
      }

      const recipientId = parseInt(dto.target_id, 10);
      if (isNaN(recipientId)) {
        throw new ForbiddenException('Invalid target_id for user.');
      }

      const recipient = await this.prisma.user.findUnique({
        where: { id: recipientId },
      });
      if (!recipient) {
        throw new NotFoundException('Recipient not found.');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        target_type: dto.target_type,
        target_id: dto.target_id || null,
        sender_id: userId,
      },
    });

    return {
      message: 'Message sent successfully',
      data: message,
    };
  }

  async getMessages(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        akds: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const akdIds = user.akds.map((akd) => akd.akd_id.toString());
    const conditions = [];

    // Direct messages to this user
    conditions.push({ target_type: 'user', target_id: user.id.toString() });

    // Broadcasts to 'all'
    conditions.push({ target_type: 'all' });

    // Broadcasts to this user's komisi
    if (user.komisi_id) {
      conditions.push({
        target_type: 'komisi',
        target_id: user.komisi_id.toString(),
      });
    }

    // Broadcasts to this user's fraksi
    if (user.fraksi_id) {
      conditions.push({
        target_type: 'fraksi',
        target_id: user.fraksi_id.toString(),
      });
    }

    // Broadcasts to this user's akds
    if (akdIds.length > 0) {
      conditions.push({ target_type: 'akd', target_id: { in: akdIds } });
    }

    // Broadcasts to this user's role
    if (user.role_id) {
      conditions.push({ target_type: 'role', target_id: user.role_id.toString() });
    }

    const messages = await this.prisma.message.findMany({
      where: {
        OR: conditions,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    return {
      total: messages.length,
      data: messages,
    };
  }
}
