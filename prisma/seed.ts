import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("1793", 10);
  await prisma.operator.upsert({
    where: { username: "ADMIN" },
    update: {},
    create: { name: "ADMIN", username: "ADMIN", passwordHash: hash, role: "admin" }
  const hash = await bcrypt.hash("demo1234", 10);
  await prisma.operator.upsert({
    where: { username: "operador" },
    update: {},
    create: { name: "Operador Demo", username: "operador", passwordHash: hash, role: "admin" }
  });
}

main().finally(() => prisma.$disconnect());
