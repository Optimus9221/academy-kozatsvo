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
    data: { pdfUrls: JSON.stringify(["/documents/statut-mak.docx"]) },
  });

  console.log("Join rules document URL updated to /documents/statut-mak.docx");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
