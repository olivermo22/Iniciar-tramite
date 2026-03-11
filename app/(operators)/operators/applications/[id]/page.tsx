import { prisma } from "@/lib/prisma";
import { ResendButton } from "@/components/operators/ResendButton";

export default async function Detail({ params }: { params: { id: string } }) {
  const app = await prisma.application.findUnique({ where: { id: params.id }, include: { events: { orderBy: { createdAt: "desc" } } } });
  if (!app) return <main className="p-6">No encontrado</main>;
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="card"><h1 className="text-xl font-bold">{app.folio}</h1><p>{app.firstName} {app.lastName}</p><p>{app.curp}</p><p>{app.whatsappPhone}</p><p>{app.dhlLocationName} - {app.dhlFullAddress}</p><div className="flex gap-2 mt-2"><ResendButton id={app.id} /><button className="text-sm underline" onClick={() => {}}>Copiar mensaje</button><a className="text-sm underline" href={`https://wa.me/${app.whatsappTargetNumber}?text=${encodeURIComponent(app.whatsappMessageText)}`} target="_blank">Abrir WhatsApp</a></div></div>
      <div className="grid md:grid-cols-3 gap-4">{app.personPhotoUrl && <img className="card" src={app.personPhotoUrl} alt="foto persona" />}{app.idPhotoUrl && <img className="card" src={app.idPhotoUrl} alt="identificación" />}{app.signatureUrl && <img className="card" src={app.signatureUrl} alt="firma" />}</div>
      <div className="card"><h3 className="font-semibold">Historial</h3><ul className="text-sm list-disc pl-6">{app.events.map((e) => <li key={e.id}>{e.eventType} - {new Date(e.createdAt).toLocaleString()}</li>)}</ul></div>
    </main>
  );
}
