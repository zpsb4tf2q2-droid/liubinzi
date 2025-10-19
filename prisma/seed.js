const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data for idempotent seeding in dev
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'user@example.com',
      emailVerified: new Date(),
      image: null,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: '123456',
      access_token: 'demo-access-token',
      token_type: 'bearer',
      scope: 'read:user',
      id_token: null,
      session_state: null,
    },
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: 'demo-session-token',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: 'user@example.com',
      token: 'demo-verification-token',
      expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  console.log('Seeded demo user for auth flow:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
