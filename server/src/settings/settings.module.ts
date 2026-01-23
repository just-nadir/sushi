import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from '../prisma/prisma.service';

import { StoreStatusController } from './store-status.controller';

@Module({
    controllers: [SettingsController, StoreStatusController],
    providers: [SettingsService, PrismaService],
})
export class SettingsModule { }
