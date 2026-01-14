import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import * as bcrypt from 'bcrypt';

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);

    const existingAdmin = await prisma.user.findFirst({
        where: { username: 'admin' }
    });

    if (existingAdmin) {
        await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                password: adminPassword,
                role: 'ADMIN'
            }
        });
        console.log('Admin user updated.');
    } else {
        await prisma.user.create({
            data: {
                username: 'admin',
                password: adminPassword,
                fullName: 'Administrator',
                phone: '+998901234567',
                role: 'ADMIN'
            }
        });
        console.log('Admin user created.');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
