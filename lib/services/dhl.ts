export type DhlLocation = {
  id: string;
  name: string;
  street: string;
  exteriorNumber?: string;
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  schedule?: string;
  locationType?: string;
};

const mockLocations: DhlLocation[] = [
  {
    id: "DHL-MOCK-001",
    name: "DHL Chilpancingo Centro",
    street: "Av. Juárez",
    exteriorNumber: "12",
    neighborhood: "Centro",
    postalCode: "39000",
    city: "Chilpancingo",
    state: "Guerrero",
    fullAddress: "Av. Juárez 12, Centro, 39000, Chilpancingo, Guerrero",
    latitude: 17.5515,
    longitude: -99.5035,
    schedule: "L-V 09:00-18:00",
    locationType: "Service Point"
  },
  {
    id: "DHL-MOCK-002",
    name: "DHL Acapulco Diamante",
    street: "Blvd de las Naciones",
    exteriorNumber: "3114",
    neighborhood: "Granjas del Márquez",
    postalCode: "39890",
    city: "Acapulco",
    state: "Guerrero",
    fullAddress: "Blvd de las Naciones 3114, Granjas del Márquez, 39890, Acapulco, Guerrero",
    latitude: 16.8232,
    longitude: -99.8094,
    schedule: "L-S 09:00-19:00",
    locationType: "Store"
  }
];

function distKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchDhlLocations(lat: number, lng: number): Promise<DhlLocation[]> {
  if (process.env.DHL_USE_MOCK !== "false") {
    return mockLocations
      .map((l) => ({ ...l, distanceKm: Number(distKm(lat, lng, l.latitude, l.longitude).toFixed(2)) }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  const base = process.env.DHL_API_BASE_URL;
  const token = process.env.DHL_API_TOKEN;
  if (!base || !token) throw new Error("DHL API no configurada");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(`${base}?latitude=${lat}&longitude=${lng}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    if (res.status === 401) throw new Error("401");
    throw new Error("DHL_UNAVAILABLE");
  }

  const json = await res.json();
  return (json.locations || []).map((it: any) => ({
    id: String(it.id),
    name: it.name,
    street: it.address?.streetLine1 || "",
    exteriorNumber: it.address?.streetNumber || "",
    neighborhood: it.address?.district || "",
    postalCode: it.address?.postalCode || "",
    city: it.address?.city || "",
    state: it.address?.state || "",
    fullAddress: `${it.address?.streetLine1 || ""} ${it.address?.streetNumber || ""}, ${it.address?.city || ""}`,
    latitude: Number(it.position?.latitude),
    longitude: Number(it.position?.longitude),
    distanceKm: it.distance,
    schedule: it.openingHours,
    locationType: it.type
  }));
}
