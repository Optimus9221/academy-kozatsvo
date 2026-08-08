/**
 * Rename admin login email (keeps password and role).
 *
 * Usage:
 *   npx tsx prisma/update-admin-email.ts [oldEmail] [newEmail]
 *
 * Defaults:
 *   old: admin@academy.ua
 *   new: aleksandrsqvr@gmail.com
 */
import "dotenv/config";
import { prisma } from "./client";

async function main() {
  const oldEmail = (process.argv[2] || "admin@academy.ua").trim().toLowerCase();
  const newEmail = (process.argv[3] || "aleksandrsqvr@gmail.com")
    .trim()
    .toLowerCase();

  if (!newEmail.includes("@")) {
    console.error("Invalid new email");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    console.log(`User already exists: ${newEmail} (${existing.role})`);
    if (oldEmail !== newEmail) {
      const old = await prisma.user.findUnique({ where: { email: oldEmail } });
      if (old && old.id !== existing.id) {
        console.log(
          `Note: old account ${oldEmail} still exists. Remove it manually if unused.`
        );
      }
    }
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: oldEmail } });
  if (!user) {
    // Fallback: update first ADMIN
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
    });
    if (!admin) {
      console.error(`No admin user found (looked for ${oldEmail})`);
      process.exit(1);
    }
    await prisma.user.update({
      where: { id: admin.id },
      data: { email: newEmail },
    });
    console.log(`Updated ADMIN ${admin.email} → ${newEmail}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail },
  });
  console.log(`Updated ${oldEmail} → ${newEmail} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
