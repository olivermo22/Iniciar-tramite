import { NextRequest, NextResponse } from "next/server";
import { fetchDhlLocations } from "@/lib/services/dhl";

export async function GET(req: NextRequest) {
  try {
    const lat = Number(req.nextUrl.searchParams.get("lat"));
    const lng = Number(req.nextUrl.searchParams.get("lng"));
    if (Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    const locations = await fetchDhlLocations(lat, lng);
    return NextResponse.json({ locations });
  } catch (error: any) {
    const msg = error?.message || "error";
    const status = msg === "401" ? 401 : 503;
    return NextResponse.json({ error: msg }, { status });
  }
}
