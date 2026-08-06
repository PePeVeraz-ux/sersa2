import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, AuthModule, ChatModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
