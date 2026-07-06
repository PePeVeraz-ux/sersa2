import { Controller, Patch, Post, Get, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Patch('patient')
  async updatePatientProfile(@Req() req: any, @Body() body: any) {
    return this.profilesService.updatePatientProfile(req.user.sub, body);
  }

  @Patch('nurse')
  async updateNurseProfile(@Req() req: any, @Body() body: any) {
    return this.profilesService.updateNurseProfile(req.user.sub, body);
  }

  @Post('credentials/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadCredential(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('type') type: string) {
    return this.profilesService.uploadCredential(req.user.sub, file.filename, type || 'professional_license');
  }

  @Get('credentials')
  async getCredentials(@Req() req: any) {
    return this.profilesService.getCredentials(req.user.sub);
  }

  @Get('nurse/patients')
  async getNursePatients(@Req() req: any) {
    return this.profilesService.getNursePatients(req.user.sub);
  }
}

