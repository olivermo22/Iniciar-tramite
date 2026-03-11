"use client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

type Location = {
  id: string;
  name: string;
  fullAddress: string;
  street: string;
  exteriorNumber?: string;
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  schedule?: string;
  locationType?: string;
};

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 12);
  }, [position, map]);
  return null;
}

export function DhlMap({ onConfirm }: { onConfirm: (location: Location) => void }) {
  const [center, setCenter] = useState<[number, number]>([17.55, -99.5]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [confirmed, setConfirmed] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(lat: number, lng: number) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/dhl/locations?lat=${lat}&lng=${lng}`);
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setLocations([]);
      setError(`No se pudieron cargar sucursales (${json.error || "error"}).`);
      return;
    }
    setLocations(json.locations || []);
    if (!json.locations?.length) setError("No hay sucursales disponibles para esta zona.");
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        setCenter(pos);
        load(pos[0], pos[1]);
      },
      () => load(center[0], center[1])
    );
  }, []);

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Selecciona la sucursal DHL más cercana</h3>
      <p className="text-sm text-slate-600">Elige la sucursal donde se enviará tu trámite.</p>
      <button
        type="button"
        className="px-3 py-2 border rounded-lg text-sm w-fit"
        onClick={() =>
          navigator.geolocation.getCurrentPosition((p) => {
            const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
            setCenter(pos);
            load(pos[0], pos[1]);
          })
        }
      >
        Centrar en mi ubicación
      </button>
      {loading && <p className="text-sm">Cargando sucursales DHL...</p>}
      {error && <p className="text-sm text-amber-700">{error}</p>}

      <MapContainer center={center} zoom={11} className="h-72 rounded-lg z-0">
        <Recenter position={center} />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]} eventHandlers={{ click: () => setSelected(loc) }}>
            <Popup>
              {loc.name}
              <br />
              {loc.fullAddress}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="text-sm font-medium">Sucursal seleccionada</p>
      {confirmed ? (
        <div className="text-sm rounded-lg bg-emerald-50 p-3 border border-emerald-200">{confirmed.name} - {confirmed.fullAddress}</div>
      ) : (
        <p className="text-sm text-slate-500">Sin seleccionar</p>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 max-w-md w-full space-y-2">
            <h4 className="font-semibold">Confirmar sucursal DHL</h4>
            <p className="text-sm">{selected.name}</p>
            <p className="text-sm text-slate-600">{selected.fullAddress}</p>
            {selected.schedule && <p className="text-xs">{selected.schedule}</p>}
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-2 border rounded-lg" onClick={() => setSelected(null)}>
                Cancelar
              </button>
              <button
                className="px-3 py-2 bg-brand-500 text-white rounded-lg"
                onClick={() => {
                  onConfirm(selected);
                  setConfirmed(selected);
                  setSelected(null);
                }}
              >
                Confirmar sucursal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
