import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo.user@example.com';
const DEMO_PASSWORD_HASH = '$2a$12$EXRkfkdmXn2gzds2SSitu.7Me3IfyQ.V3ZXRD2.UyX1k6EK11RHi';

async function main() {
  const now = new Date();
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: 'Demo User',
      hashedPassword: DEMO_PASSWORD_HASH,
      emailVerified: now,
      image: null,
      updatedAt: now,
    },
    create: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      hashedPassword: DEMO_PASSWORD_HASH,
      emailVerified: now,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
  });
}

main()
  .then(() => {
    console.info('Seed data inserted successfully.');
  })
  .catch((error) => {
    console.error('Error while seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
