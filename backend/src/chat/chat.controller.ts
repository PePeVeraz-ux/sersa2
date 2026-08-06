import { Controller, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('notifications')
  async getNotifications(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    const notifs = await this.chatService.getUserNotifications(userId);
    return notifs.map((n) => ({
      id: n.id,
      title: n.title,
      desc: n.body,
      time: n.created_at.toISOString(),
      unread: !n.read_at,
      payload: n.payload,
    }));
  }

  @Patch('notifications/read')
  async markAsRead(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.chatService.markNotificationsAsRead(userId);
  }
}
