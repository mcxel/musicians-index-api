// tmi-platform/apps/api/src/seed-admin.ts
import { PrismaClient, Role } from '.prisma/client';

// This script is intended for one-time use to bootstrap the initial admin accounts.
// It creates the users and marks their email as verified, but does NOT set a password.
// The admins must use the "Forgot Password" flow to set their initial password securely.

const prisma = new PrismaClient();

const ADMIN_ACCOUNTS = [
  {
    name: 'Marcel',
    email: process.env.MARCEL_EMAIL || '[REPLACE_WITH_MARCEL_EMAIL]',
  },
  {
    name: 'J. Paul Sanchez',
    email: process.env.JPAUL_EMAIL || '[REPLACE_WITH_JPAUL_EMAIL]',
  },
];

async function main() {
  console.log('Starting admin user bootstrap script...');

  if (ADMIN_ACCOUNTS.some(acc => acc.email.startsWith('['))) {
    console.error(
      'ERROR: Please replace the placeholder emails in the script or set MARCEL_EMAIL and JPAUL_EMAIL environment variables.',
    );
    process.exit(1);
  }

  for (const admin of ADMIN_ACCOUNTS) {
    console.log(`Processing user: ${admin.name} (${admin.email})`);

    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      console.log('User already exists. Ensuring admin role...');
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: Role.ADMIN,
          emailVerified: existingUser.emailVerified || new Date(), // Mark as verified if not already
        },
      });
      console.log(`User ${admin.name} updated to ADMIN.`);
    } else {
      console.log('User not found. Creating new admin user...');
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          role: Role.ADMIN,
          emailVerified: new Date(), // Pre-verify the email
          passwordHash: null, // Ensure no password is set
          onboardingState: 'COMPLETE', // Admins don't need to go through onboarding
          onboardingCompletedAt: new Date(),
        },
      });
      console.log(`User ${admin.name} created as ADMIN.`);
    }
  }

  console.log('\n✅ Admin bootstrap script finished successfully.');
  console.log(
    '\nNEXT STEP: The admins should now go to the login page and use the "Forgot Password" feature to set their initial password.',
  );
}

main()
  .catch((e) => {
    console.error('An error occurred during the bootstrap script:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
