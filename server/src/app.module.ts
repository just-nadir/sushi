import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersGateway } from './orders/orders.gateway';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TelegramBotService } from './common/services/telegram-bot.service';

import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'client-telegram', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    FilesModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService, OrdersGateway],
})
export class AppModule { }
