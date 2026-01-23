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

    // --- Sample Data Seeding ---
    console.log('Seeding sample data...');

    // Categories
    const categories = [
        { name: 'Ssetlar', sortOrder: 1 },
        { name: 'Rolls', sortOrder: 2 },
        { name: 'Issiq Rollar', sortOrder: 3 },
        { name: 'Ichimliklar', sortOrder: 4 },
    ];

    for (const cat of categories) {
        const existingCat = await prisma.category.findFirst({ where: { name: cat.name } });
        if (!existingCat) {
            const createdCat = await prisma.category.create({ data: cat });

            // Add some products to each category
            if (cat.name === 'Rolls') {
                await prisma.product.createMany({
                    data: [
                        { name: 'Filadelfiya Roll', description: 'Losos, pishloq, bodring, guruch', price: 45000, categoryId: createdCat.id, isAvailable: true },
                        { name: 'Kaliforniya Roll', description: 'Krab tayoqchalari, pishloq, bodring, kunjut', price: 38000, categoryId: createdCat.id, isAvailable: true },
                    ]
                });
            } else if (cat.name === 'Ssetlar') {
                await prisma.product.createMany({
                    data: [
                        { name: 'Sset Mini', description: '12 dona turli xil rollar', price: 95000, categoryId: createdCat.id, isAvailable: true },
                        { name: 'Sset Max', description: '24 dona turli xil rollar', price: 180000, categoryId: createdCat.id, isAvailable: true },
                    ]
                });
            } else if (cat.name === 'Ichimliklar') {
                await prisma.product.createMany({
                    data: [
                        { name: 'Coca-Cola 0.5L', description: 'Salqin yoqimli ichimlik', price: 10000, categoryId: createdCat.id, isAvailable: true },
                        { name: 'Suv 0.5L', description: 'Gazsiz toza suv', price: 5000, categoryId: createdCat.id, isAvailable: true },
                    ]
                });
            }
        }
    }
    console.log('Sample data seeded successfully.');
    // Settings
    console.log('Seeding settings...');
    const settings = [
        { key: 'work_start', value: '09:00', description: 'Ish vaqti boshlanishi' },
        { key: 'work_end', value: '23:59', description: 'Ish vaqti tugashi' },
        { key: 'break_start', value: '20:00', description: 'Tanaffus boshlanishi' },
        { key: 'break_end', value: '22:00', description: 'Tanaffus tugashi' },
        { key: 'store_mode', value: 'AUTO', description: 'Do\'kon holati (AUTO/OPEN/CLOSED)' },
    ];

    for (const s of settings) {
        await prisma.setting.upsert({
            where: { key: s.key },
            update: {},
            create: s
        });
    }
    console.log('Settings seeded successfully.');
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
