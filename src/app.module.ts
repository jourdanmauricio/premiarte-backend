import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ResponsiblesModule } from './responsibles/responsibles.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ContactsModule } from './contacts/contacts.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EnvModels } from 'env.models';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvModels>) => ({
        transport: {
          host: config.getOrThrow('SMTP_HOST'),
          port: config.get('SMTP_PORT', 587),
          secure: false,
          auth: {
            user: config.getOrThrow('SMTP_USER'),
            pass: config.getOrThrow('SMTP_PASS'),
          },
        },
        defaults: {
          // Gmail requiere que "from" coincida con la cuenta autenticada; usar solo email evita errores de codificación
          from: config.getOrThrow('SMTP_USER'),
        },
      }),
    }),
    PrismaModule,
    MailModule,
    UsersModule,
    CategoriesModule,
    AuthModule,
    ImagesModule,
    ProductsModule,
    SettingsModule,
    SubscribeModule,
    BudgetsModule,
    ResponsiblesModule,
    CustomersModule,
    OrdersModule,
    ContactsModule,
    NewslettersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
