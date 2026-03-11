"use client";
import { useRef, useState } from "react";

type UploadResult = { url: string; mime: string; size: number; source: "camera" | "file" | "upload" | "drawn" };

type Props = {
  title: string;
  subtitle: string;
  emptyText: string;
  useText: string;
  changeText: string;
  onConfirm: (file: UploadResult) => void;
  lensControl?: boolean;
};

export function ImageUploader({ title, subtitle, emptyText, useText, changeText, onConfirm, lensControl }: Props) {
  const [preview, setPreview] = useState<string>("");
  const [fileMeta, setFileMeta] = useState<UploadResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [glasses, setGlasses] = useState<"no" | "transparentes" | "oscuros" | "">("");
  const refFile = useRef<HTMLInputElement>(null);
  const refCamera = useRef<HTMLInputElement>(null);

  async function upload(file: File, source: "camera" | "file") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("source", source);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setPreview(json.url);
    setFileMeta(json);
    setConfirmed(false);
  }

  const canConfirm = !!fileMeta && (!lensControl || (glasses !== "" && glasses !== "oscuros"));

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-600">{subtitle}</p>
      <div className="flex gap-2">
        <button type="button" className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm" onClick={() => refCamera.current?.click()}>Tomar foto</button>
        <button type="button" className="px-3 py-2 rounded-lg border text-sm" onClick={() => refFile.current?.click()}>Subir archivo</button>
      </div>
      <input ref={refCamera} hidden type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "camera")} />
      <input ref={refFile} hidden type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "file")} />
      {!preview && <p className="text-sm text-slate-500">{emptyText}</p>}
      {preview && <img src={preview} alt={title} className="w-full max-h-56 object-contain rounded-lg border" />}

      {lensControl && preview && (
        <div className="space-y-1 text-sm">
          <p className="font-medium">¿La persona usa lentes en la foto?</p>
          <label className="block"><input type="radio" name="g" onChange={() => setGlasses("no")} /> No, no usa lentes</label>
          <label className="block"><input type="radio" name="g" onChange={() => setGlasses("transparentes")} /> Sí, usa lentes transparentes</label>
          <label className="block"><input type="radio" name="g" onChange={() => setGlasses("oscuros")} /> Sí, usa lentes oscuros</label>
          {glasses === "oscuros" && <p className="error">La foto debe tomarse sin lentes oscuros.</p>}
          {glasses === "transparentes" && <p className="text-amber-600 text-xs">Se recomienda repetirla sin lentes si es posible.</p>}
        </div>
      )}

      {preview && (
        <div className="flex gap-2">
          <button type="button" disabled={!canConfirm} className="px-3 py-2 rounded-lg bg-brand-500 disabled:bg-slate-300 text-white text-sm" onClick={() => {
            if (!fileMeta) return;
            onConfirm({ ...fileMeta, source: fileMeta.source, ...(lensControl ? { glassesStatus: glasses } : {}) } as any);
            setConfirmed(true);
          }}>{useText}</button>
          <button type="button" className="px-3 py-2 rounded-lg border text-sm" onClick={() => { setPreview(""); setFileMeta(null); setConfirmed(false); }}>{changeText}</button>
          {confirmed && <span className="text-xs text-emerald-700 self-center">Confirmado</span>}
        </div>
      )}
    </div>
  );
}
