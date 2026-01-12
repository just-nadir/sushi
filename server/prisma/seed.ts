import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // No seeds, we want an empty DB for real data usage.
    console.log('Database is ready for real data.')
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
