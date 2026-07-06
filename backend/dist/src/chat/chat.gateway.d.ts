import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(chatService: ChatService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, payload: {
        serviceRequestId: string;
    }): Promise<{
        event: string;
        data: {
            conversationId: string;
        };
    }>;
    handleSendMessage(client: Socket, payload: {
        conversationId: string;
        text: string;
    }): Promise<void>;
    handleTyping(client: Socket, payload: {
        conversationId: string;
        isTyping: boolean;
    }): void;
}
