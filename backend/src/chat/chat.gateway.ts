import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map to store connected clients: userId -> socketId[]
  private connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'default_secret_key_for_development' });
      const userId = payload.sub;
      client.data.user = payload;

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Notify others user is online
      this.server.emit('userStatus', { userId, status: 'online' });
    } catch (e) {
      this.logger.error(`Connection error: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId && this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId)!.delete(client.id);
      if (this.connectedUsers.get(userId)!.size === 0) {
        this.connectedUsers.delete(userId);
        this.server.emit('userStatus', { userId, status: 'offline' });
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { serviceRequestId: string }
  ) {
    const conversation = await this.chatService.getOrCreateConversation(payload.serviceRequestId);
    client.join(`conv_${conversation.id}`);
    
    // Send previous messages to this client
    const messages = await this.chatService.getMessages(conversation.id);
    client.emit('conversationHistory', { conversationId: conversation.id, messages });
    
    return { event: 'joined', data: { conversationId: conversation.id } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; text: string }
  ) {
    const userId = client.data.user?.sub;
    if (!userId) return;

    const message = await this.chatService.saveMessage(payload.conversationId, userId, payload.text);
    
    // Broadcast message to everyone in the room (including sender)
    this.server.to(`conv_${payload.conversationId}`).emit('newMessage', message);
    
    // Note: Here we could also lookup the other participant and send a push notification
    // if they are not currently connected
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean }
  ) {
    const userId = client.data.user?.sub;
    // Broadcast typing event to others in the room
    client.broadcast.to(`conv_${payload.conversationId}`).emit('userTyping', {
      userId,
      isTyping: payload.isTyping
    });
  }
}
