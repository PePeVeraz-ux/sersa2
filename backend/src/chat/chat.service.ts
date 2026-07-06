import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(serviceRequestId: string) {
    let conversation = await this.prisma.conversation.findUnique({
      where: { service_request_id: serviceRequestId },
      include: {
        service_request: {
          include: { patient: true, assigned_nurse: true }
        }
      }
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          service_request_id: serviceRequestId,
        },
        include: {
          service_request: {
            include: { patient: true, assigned_nurse: true }
          }
        }
      });
    }

    return conversation;
  }

  async saveMessage(conversationId: string, senderId: string, body: string) {
    return this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: senderId,
        body,
      },
      include: {
        sender: {
          select: { id: true, role: true }
        }
      }
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
      include: {
        sender: {
          select: { id: true, role: true }
        }
      }
    });
  }
}
