"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    jwtService;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    connectedUsers = new Map();
    constructor(chatService, jwtService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
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
            this.connectedUsers.get(userId).add(client.id);
            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
            this.server.emit('userStatus', { userId, status: 'online' });
        }
        catch (e) {
            this.logger.error(`Connection error: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.user?.sub;
        if (userId && this.connectedUsers.has(userId)) {
            this.connectedUsers.get(userId).delete(client.id);
            if (this.connectedUsers.get(userId).size === 0) {
                this.connectedUsers.delete(userId);
                this.server.emit('userStatus', { userId, status: 'offline' });
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinConversation(client, payload) {
        const conversation = await this.chatService.getOrCreateConversation(payload.serviceRequestId);
        client.join(`conv_${conversation.id}`);
        const messages = await this.chatService.getMessages(conversation.id);
        client.emit('conversationHistory', { conversationId: conversation.id, messages });
        return { event: 'joined', data: { conversationId: conversation.id } };
    }
    async handleSendMessage(client, payload) {
        const userId = client.data.user?.sub;
        if (!userId)
            return;
        const message = await this.chatService.saveMessage(payload.conversationId, userId, payload.text);
        this.server.to(`conv_${payload.conversationId}`).emit('newMessage', message);
    }
    handleTyping(client, payload) {
        const userId = client.data.user?.sub;
        client.broadcast.to(`conv_${payload.conversationId}`).emit('userTyping', {
            userId,
            isTyping: payload.isTyping
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map