import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findAll();
    }

    @Patch(':key')
    update(@Param('key') key: string, @Body('value') value: string) {
        return this.settingsService.update(key, value);
    }
    @Get('telegram-users')
    findTelegramUsers() {
        return this.settingsService.findTelegramUsers();
    }
}
