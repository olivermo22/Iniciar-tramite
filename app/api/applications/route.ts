import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { buildWhatsappMessage } from "@/lib/whatsapp";
import { rateLimit } from "@/lib/rate-limit";

function folio() { return `SOL-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`; }

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });

  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const whatsappMessageText = buildWhatsappMessage(parsed.data);
  const saved = await prisma.application.create({
    data: {
      folio: folio(),
      status: "nueva",
      ...parsed.data,
      dhlLocationId: parsed.data.dhlLocation.id,
      dhlLocationName: parsed.data.dhlLocation.name,
      dhlStreet: parsed.data.dhlLocation.street,
      dhlExteriorNumber: parsed.data.dhlLocation.exteriorNumber,
      dhlNeighborhood: parsed.data.dhlLocation.neighborhood,
      dhlPostalCode: parsed.data.dhlLocation.postalCode,
      dhlCity: parsed.data.dhlLocation.city,
      dhlState: parsed.data.dhlLocation.state,
      dhlFullAddress: parsed.data.dhlLocation.fullAddress,
      dhlLatitude: parsed.data.dhlLocation.latitude,
      dhlLongitude: parsed.data.dhlLocation.longitude,
      dhlDistanceKm: parsed.data.dhlLocation.distanceKm,
      dhlSchedule: parsed.data.dhlLocation.schedule,
      dhlLocationType: parsed.data.dhlLocation.locationType,
      personPhotoUrl: parsed.data.personPhoto.url,
      personPhotoMime: parsed.data.personPhoto.mime,
      personPhotoSize: parsed.data.personPhoto.size,
      personPhotoSource: parsed.data.personPhoto.source,
      personPhotoGlassesStatus: parsed.data.personPhoto.glassesStatus,
      idPhotoUrl: parsed.data.idPhoto.url,
      idPhotoMime: parsed.data.idPhoto.mime,
      idPhotoSize: parsed.data.idPhoto.size,
      idPhotoSource: parsed.data.idPhoto.source,
      signatureUrl: parsed.data.signature.url,
      signatureType: parsed.data.signature.type,
      whatsappMessageText,
      whatsappTargetNumber: process.env.WHATSAPP_TARGET_NUMBER || "7225600905"
    }
  });

  await prisma.applicationEvent.create({
    data: { applicationId: saved.id, eventType: "created", eventPayload: { status: "nueva" } }
  });

  return NextResponse.json({ id: saved.id, folio: saved.folio, whatsappMessageText, whatsappTargetNumber: saved.whatsappTargetNumber });
}
