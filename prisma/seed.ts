import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      passwordHash,
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  });
}

main()
  .then(() => {
    console.log("Database seeded with demo user");
  })
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
