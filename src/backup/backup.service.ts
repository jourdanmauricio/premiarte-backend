import { execSync } from 'child_process';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { EnvModels } from 'env.models';
import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService<EnvModels>,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleScheduledBackup() {
    this.logger.log('Ejecutando backup programado...');
    await this.runBackup('cron');
  }

  async runBackup(triggeredBy: 'cron' | 'manual'): Promise<{ success: boolean; message: string }> {
    try {
      const sqlDump = this.fetchDumpFromTurso();

      await this.mailService.sendBackupEmail(sqlDump);

      await this.prisma.client.backupLog.create({
        data: {
          status: 'success',
          message: `Backup enviado a ${process.env.BACKUP_EMAIL_RECIPIENT}`,
          triggeredBy,
        },
      });

      return { success: true, message: 'Backup generado y enviado por email.' };
    } catch (error) {
      await this.prisma.client.backupLog.create({
        data: {
          status: 'error',
          message: (error as Error).message,
          triggeredBy,
        },
      });

      this.logger.error('Error en el backup', error);
      return { success: false, message: (error as Error).message };
    }
  }

  async getLogs() {
    return this.prisma.client.backupLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private fetchDumpFromTurso(): string {
    const db = process.env.TURSO_DB_NAME;
    const token = process.env.TURSO_API_TOKEN;

    try {
      const dump = execSync(`turso db shell ${db} .dump`, {
        encoding: 'utf-8',
        timeout: 60000,
        env: {
          ...process.env,
          TURSO_API_TOKEN: token,
          HOME: process.env.HOME, // necesario para que el CLI encuentre su config
        },
      });
      return dump;
    } catch (error) {
      throw new Error(`Error al generar dump: ${(error as Error).message}`);
    }
  }
}
