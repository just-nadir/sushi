import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('store')
export class StoreStatusController {
    constructor(private prisma: PrismaService) { }

    @Get('status')
    async getStatus() {
        // Fetch settings
        const settings = await this.prisma.setting.findMany({
            where: {
                key: { in: ['work_start', 'work_end', 'break_start', 'break_end', 'store_mode', 'phone'] }
            }
        });

        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const mode = config['store_mode'] || 'AUTO';
        const phone = config['phone'] || '+998901234567';

        // Manual Overrides
        if (mode === 'OPEN') {
            return { isOpen: true, message: "Ochiq", mode, nextChange: null, phone };
        }
        if (mode === 'CLOSED') {
            return { isOpen: false, message: "Vaqtinchalik yopiq", mode, nextChange: null, phone };
        }

        // AUTO Logic
        const now = new Date();
        // Convert to local time string HH:mm for easy comparison
        // Note: Server time might be UTC, but we assume local usage or handle timezone offset.
        // For simplicity in this local dev env, we use local time string.
        const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // "14:30"

        const workStart = config['work_start'] || "09:00";
        const workEnd = config['work_end'] || "23:59";
        const breakStart = config['break_start'] || "20:00";
        const breakEnd = config['break_end'] || "22:00";

        // Check if within working hours
        // Handle midnight crossing (e.g. 09:00 to 02:00)
        let isWorkingHours = false;
        if (workEnd < workStart) {
            isWorkingHours = currentTime >= workStart || currentTime <= workEnd;
        } else {
            isWorkingHours = currentTime >= workStart && currentTime <= workEnd;
        }

        if (!isWorkingHours) {
            return {
                isOpen: false,
                message: `Ish vaqti: ${workStart} - ${workEnd}`,
                mode,
                nextChange: workStart,
                phone
            };
        }

        // Check break time
        let isBreakTime = false;
        if (breakEnd < breakStart) {
            isBreakTime = currentTime >= breakStart || currentTime <= breakEnd;
        } else {
            isBreakTime = currentTime >= breakStart && currentTime <= breakEnd;
        }

        if (isBreakTime) {
            return {
                isOpen: false,
                message: `Tanaffus: ${breakStart} - ${breakEnd}`,
                mode,
                nextChange: breakEnd,
                phone
            };
        }

        return { isOpen: true, message: "Ochiq", mode, nextChange: isBreakTime ? breakEnd : (isWorkingHours ? workEnd : null), phone };
    }
}
