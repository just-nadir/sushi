import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
    @ApiProperty()
    value: string;
}

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    findAll() {
        return this.settingsService.findAll();
    }

    @Patch(':key')
    update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
        return this.settingsService.update(key, updateSettingDto.value);
    }
    @Get('telegram-users')
    findTelegramUsers() {
        return this.settingsService.findTelegramUsers();
    }
}
