import "dotenv/config";
import { prisma } from "./client";

async function main() {
  const rules = await prisma.joinRules.findFirst();
  if (!rules) {
    console.error("JoinRules not found");
    process.exit(1);
  }

  await prisma.joinRules.update({
    where: { id: rules.id },
    data: { pdfUrls: JSON.stringify(["/about/documents/statut"]) },
  });

  console.log("Join rules link updated to /about/documents/statut");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
