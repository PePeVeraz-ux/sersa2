import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { AddressesModule } from './addresses/addresses.module';
import { RequestsModule } from './requests/requests.module';
import { ClinicalReportsModule } from './clinical-reports/clinical-reports.module';
import { WalletsModule } from './wallets/wallets.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    AuthModule, 
    PrismaModule, 
    ServicesModule, 
    AddressesModule, 
    RequestsModule, 
    ClinicalReportsModule, 
    WalletsModule,
    ChatModule,
    AdminModule,
    ProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
