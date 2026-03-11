"use client";

export function ResendButton({ id }: { id: string }) {
  return <button className="text-sm underline" onClick={async () => {
    const res = await fetch("/api/operators/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const json = await res.json();
    if (!res.ok) return alert(json.error);
    window.open(`https://wa.me/${json.phone}?text=${encodeURIComponent(json.message)}`, "_blank");
  }}>Reenviar mensaje</button>;
}
