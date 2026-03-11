import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("3971", 10);
  await prisma.operator.upsert({
    where: { username: "ADMIN" },
    update: {},
    create: { name: "ADMIN", username: "ADMIN", passwordHash: hash, role: "admin" }
  });
}

main().finally(() => prisma.$disconnect());
