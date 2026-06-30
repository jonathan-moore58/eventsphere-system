import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'ORGANIZER' }
  });

  for (const user of users) {
    const existing = await prisma.organizer.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.organizer.create({ data: { userId: user.id } });
      console.log(`Created Organizer profile for ${user.email}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
