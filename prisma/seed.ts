import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = "demo.user@example.com";
const DEMO_USER_PASSWORD = "ChangeMe123!";
const DEMO_USER_NAME = "Demo User";

async function main() {
  const hashedPassword = await hash(DEMO_USER_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {
      name: DEMO_USER_NAME,
      hashedPassword,
    },
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.info("✅ Database seeded.");
  console.info(`   Email: ${user.email}`);
  console.info(`   Password: ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("❌ Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
