import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ResendButton } from "@/components/operators/ResendButton";

export default async function Dashboard({ searchParams }: { searchParams: Record<string, string> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/operators/login");
  const q = searchParams.q || "";
  const status = searchParams.status || "";

  const applications = await prisma.application.findMany({
    where: {
      AND: [
        q ? { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { curp: { contains: q, mode: "insensitive" } }, { whatsappPhone: { contains: q } }] } : {},
        status ? { status } : {}
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Solicitudes</h1>
      <form className="flex gap-2"><input name="q" defaultValue={q} className="input max-w-sm" placeholder="Buscar nombre, CURP o teléfono" /><select name="status" defaultValue={status} className="input max-w-xs"><option value="">Todos</option>{["nueva","revisada","en_proceso","pendiente","completada","cancelada"].map((s)=><option key={s}>{s}</option>)}</select><button className="px-3 py-2 bg-slate-900 text-white rounded-lg">Filtrar</button></form>
      <div className="card overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th>folio</th><th>fecha</th><th>nombre</th><th>CURP</th><th>teléfono</th><th>tipo licencia</th><th>vigencia</th><th>destinatario</th><th>sucursal DHL</th><th>estado</th><th>archivos</th><th>acciones</th></tr></thead>
          <tbody>{applications.map((a) => <tr key={a.id} className="border-b"><td>{a.folio}</td><td>{new Date(a.createdAt).toLocaleDateString()}</td><td>{a.firstName} {a.lastName}</td><td>{a.curp}</td><td>{a.whatsappPhone}</td><td>{a.licenseType}</td><td>{a.validity}</td><td>{a.recipientName}</td><td>{a.dhlLocationName}</td><td>{a.status}</td><td>{a.personPhotoUrl && a.idPhotoUrl && a.signatureUrl ? "✅" : "⚠️"}</td><td><Link className="underline mr-2" href={`/operators/applications/${a.id}`}>Ver detalle</Link><ResendButton id={a.id} /></td></tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
