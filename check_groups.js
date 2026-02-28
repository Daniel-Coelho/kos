const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGroups() {
    const groups = await prisma.group.findMany();
    console.log('Groups count:', groups.length);
    console.log('Groups:', JSON.stringify(groups, null, 2));
}

checkGroups()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
