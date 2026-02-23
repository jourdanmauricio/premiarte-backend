import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
