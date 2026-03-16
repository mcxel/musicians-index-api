// scripts/promote-admin.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
  }

  console.log(`Searching for user with email: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (ID: ${user.id}). Current role: ${user.role}`);

    if (user.role === Role.ADMIN) {
      console.log('User is already an ADMIN.');
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: Role.ADMIN },
    });

    console.log(`Successfully promoted ${updatedUser.name} to ADMIN!`);

  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
