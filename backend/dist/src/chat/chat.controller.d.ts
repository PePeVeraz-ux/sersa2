import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getNotifications(req: any): Promise<{
        id: string;
        title: string;
        desc: string;
        time: string;
        unread: boolean;
        payload: import(".prisma/client").Prisma.JsonValue;
    }[]>;
    markAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
