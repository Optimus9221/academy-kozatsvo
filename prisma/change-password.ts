import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./client";

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: npx tsx prisma/change-password.ts <email> <new-password>");
    console.error("Example: npx tsx prisma/change-password.ts admin@academy.ua MyStr0ngPass!");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: await hashPassword(password) },
  });

  console.log(`Password updated for ${email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
