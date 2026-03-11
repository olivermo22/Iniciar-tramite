"use client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

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
  useEffect(() => { map.setView(position, 12); }, [position, map]);
  return null;
}

export function DhlMap({ onConfirm }: { onConfirm: (location: Location) => void }) {
  const [center, setCenter] = useState<[number, number]>([17.55, -99.5]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);

  async function load(lat: number, lng: number) {
    const res = await fetch(`/api/dhl/locations?lat=${lat}&lng=${lng}`);
    const json = await res.json();
    if (res.ok) setLocations(json.locations);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((p) => {
      setCenter([p.coords.latitude, p.coords.longitude]);
      load(p.coords.latitude, p.coords.longitude);
    }, () => load(center[0], center[1]));
  }, []);

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Selecciona la sucursal DHL más cercana</h3>
      <p className="text-sm text-slate-600">Elige la sucursal donde se enviará tu trámite.</p>
      <button type="button" className="px-3 py-2 border rounded-lg text-sm w-fit" onClick={() => navigator.geolocation.getCurrentPosition((p) => {
        const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
        setCenter(pos);
        load(pos[0], pos[1]);
      })}>Centrar en mi ubicación</button>
      <MapContainer center={center} zoom={11} className="h-72 rounded-lg z-0">
        <Recenter position={center} />
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.latitude, loc.longitude]} eventHandlers={{ click: () => setSelected(loc) }}>
            <Popup>{loc.name}<br />{loc.fullAddress}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="text-sm font-medium">Sucursal seleccionada</p>
      {selected ? <div className="text-sm rounded-lg bg-slate-100 p-3">{selected.name} - {selected.fullAddress}</div> : <p className="text-sm text-slate-500">Sin seleccionar</p>}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 max-w-md w-full space-y-2">
            <h4 className="font-semibold">Confirmar sucursal DHL</h4>
            <p className="text-sm">{selected.name}</p>
            <p className="text-sm text-slate-600">{selected.fullAddress}</p>
            {selected.schedule && <p className="text-xs">{selected.schedule}</p>}
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-2 border rounded-lg" onClick={() => setSelected(null)}>Cancelar</button>
              <button className="px-3 py-2 bg-brand-500 text-white rounded-lg" onClick={() => { onConfirm(selected); setSelected(null); }}>Confirmar sucursal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
