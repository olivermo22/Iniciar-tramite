import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await req.json();
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: "No existe" }, { status: 404 });

  const updated = await prisma.application.update({
    where: { id },
    data: { whatsappResendCount: { increment: 1 }, whatsappSentAt: new Date() }
  });

  await prisma.applicationEvent.create({
    data: { applicationId: id, eventType: "whatsapp_resent", eventPayload: { count: updated.whatsappResendCount + 1 } }
  });

  return NextResponse.json({ ok: true, message: app.whatsappMessageText, phone: app.whatsappTargetNumber });
}
