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

function withDistance(lat: number, lng: number, locations: DhlLocation[]) {
  return locations
    .map((l) => ({ ...l, distanceKm: Number((l.distanceKm ?? distKm(lat, lng, l.latitude, l.longitude)).toFixed(2)) }))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}

function mapDhlResponse(raw: any): DhlLocation[] {
  const list = raw?.locations ?? raw?.data ?? raw?.items ?? [];
  return list
    .map((it: any) => ({
      id: String(it.id ?? it.locationId ?? it.code ?? ""),
      name: it.name ?? it.locationName ?? it.displayName ?? "Sucursal DHL",
      street: it.address?.streetLine1 ?? it.address?.street ?? it.street ?? "",
      exteriorNumber: it.address?.streetNumber ?? it.exteriorNumber ?? "",
      neighborhood: it.address?.district ?? it.neighborhood ?? "",
      postalCode: it.address?.postalCode ?? it.postalCode ?? "",
      city: it.address?.city ?? it.city ?? "",
      state: it.address?.state ?? it.state ?? "",
      fullAddress:
        it.fullAddress ??
        [it.address?.streetLine1 ?? it.street, it.address?.streetNumber ?? it.exteriorNumber, it.address?.city ?? it.city, it.address?.state ?? it.state]
          .filter(Boolean)
          .join(", "),
      latitude: Number(it.position?.latitude ?? it.latitude ?? it.lat),
      longitude: Number(it.position?.longitude ?? it.longitude ?? it.lng),
      distanceKm: Number(it.distance ?? it.distanceKm ?? 0),
      schedule: it.openingHours ?? it.schedule,
      locationType: it.type ?? it.locationType
    }))
    .filter((x: DhlLocation) => x.id && !Number.isNaN(x.latitude) && !Number.isNaN(x.longitude));
}

async function fetchRealDhlLocations(lat: number, lng: number): Promise<DhlLocation[]> {
  const base = process.env.DHL_API_BASE_URL;
  const token = process.env.DHL_API_TOKEN;
  if (!base || !token) throw new Error("DHL API no configurada");

  const endpoint = `${base}${base.includes("?") ? "&" : "?"}latitude=${lat}&longitude=${lng}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.DHL_API_TIMEOUT_MS || 10000));

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "DHL-API-Key": token,
      "x-api-key": token,
      Accept: "application/json"
    },
    cache: "no-store",
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    if (res.status === 401) throw new Error("401");
    throw new Error(`DHL_${res.status}`);
  }

  const json = await res.json();
  const mapped = mapDhlResponse(json);
  if (!mapped.length) throw new Error("DHL_EMPTY");
  return withDistance(lat, lng, mapped);
}

export async function fetchDhlLocations(lat: number, lng: number): Promise<DhlLocation[]> {
  const useMock = process.env.DHL_USE_MOCK !== "false";
  if (useMock) return withDistance(lat, lng, mockLocations);

  try {
    return await fetchRealDhlLocations(lat, lng);
  } catch (error) {
    if (process.env.DHL_FALLBACK_TO_MOCK === "false") throw error;
    return withDistance(lat, lng, mockLocations);
  }
}
