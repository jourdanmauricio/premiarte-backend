import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('backup')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('run')
  async triggerBackup() {
    return this.backupService.runBackup('manual');
  }

  @Get('logs')
  async getLogs() {
    return this.backupService.getLogs();
  }
}
