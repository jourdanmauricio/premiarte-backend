/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { EnvModels } from 'env.models';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;

  constructor(private readonly configService: ConfigService<EnvModels>) {
    const adapter = new PrismaLibSql({
      url: this.configService.get('TURSO_DATABASE_URL', { infer: true })!,
      authToken: this.configService.get('TURSO_AUTH_TOKEN', { infer: true }),
    });

    this.client = new PrismaClient({ adapter } as any);
  }

  async onModuleInit() {
    await this.client.$connect();
    await this.seedAdminUser();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get('ADMIN_USER_EMAIL', { infer: true })!;
    const existingAdmin = await this.client.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(this.configService.get('ADMIN_USER_PASSWORD', { infer: true })!, 10);
      await this.client.user.create({
        data: {
          name: this.configService.get('ADMIN_USER_NAME', { infer: true })!,
          email: adminEmail,
          password: hashedPassword,
        },
      });
      console.log('✅ Usuario admin creado automáticamente');
    }
  }
}
