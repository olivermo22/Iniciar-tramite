"use client";
import { useRef, useState } from "react";

type Props = { onConfirm: (signature: { url: string; type: "upload" | "drawn" }) => void };

export function SignatureField({ onConfirm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const start = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawing(true);
  };

  const move = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">3. Firma</h3>
      <div className="flex gap-2">
        <label className="px-3 py-2 rounded-lg border text-sm cursor-pointer">Subir imagen<input hidden type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const fd = new FormData(); fd.append("file", f); fd.append("source", "upload");
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const json = await res.json();
          setPreview(json.url);
          onConfirm({ url: json.url, type: "upload" });
        }} /></label>
        <span className="px-3 py-2 rounded-lg bg-slate-100 text-sm">Dibujar firma</span>
      </div>
      {!preview && <p className="text-sm text-slate-500">Aún no hay firma</p>}
      <canvas
        ref={canvasRef}
        width={500}
        height={170}
        className="w-full border rounded-lg bg-white"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={() => setDrawing(false)}
      />
      {preview && <img src={preview} alt="firma" className="h-20 border rounded" />}
      <div className="flex gap-2">
        <button type="button" className="px-3 py-2 border rounded-lg text-sm" onClick={() => {
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx || !canvasRef.current) return;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          setPreview("");
        }}>Limpiar</button>
        <button type="button" className="px-3 py-2 rounded-lg bg-brand-500 text-white text-sm" onClick={async () => {
          if (!canvasRef.current) return;
          const blob = await new Promise<Blob | null>((resolve) => canvasRef.current!.toBlob(resolve, "image/png"));
          if (!blob) return;
          const fd = new FormData(); fd.append("file", new File([blob], "signature.png", { type: "image/png" })); fd.append("source", "drawn");
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const json = await res.json();
          setPreview(json.url);
          onConfirm({ url: json.url, type: "drawn" });
        }}>Confirmar firma</button>
        {preview && <span className="px-3 py-2 rounded-lg border text-sm">Cambiar firma</span>}
      </div>
    </div>
  );
}
