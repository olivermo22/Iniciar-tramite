"use client";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validations";
import { useState } from "react";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { SignatureField } from "@/components/forms/SignatureField";
import { whatsappUrl } from "@/lib/whatsapp";

const DhlMap = dynamic(() => import("@/components/map/DhlMap").then((m) => m.DhlMap), { ssr: false });

export default function HomePage() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ApplicationInput>({ resolver: zodResolver(applicationSchema) });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return alert("Error al enviar solicitud");
    window.open(whatsappUrl(json.whatsappMessageText, json.whatsappTargetNumber), "_blank");
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-4">
      <div className="card">
        <h1 className="text-2xl font-bold">Solicitud de trámite</h1>
        <p className="text-sm text-slate-600 mt-1">Completa tus datos y adjunta la información requerida. Al final se abrirá WhatsApp con el mensaje listo para enviar.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="card grid md:grid-cols-2 gap-3">
          <div><label className="label">Nombre(s) *</label><input className="input" {...register("firstName")} /></div>
          <div><label className="label">Apellidos *</label><input className="input" {...register("lastName")} /></div>
          <div><label className="label">CURP *</label><input className="input uppercase" {...register("curp")} /></div>
          <div><label className="label">Teléfono (WhatsApp) *</label><input className="input" {...register("whatsappPhone")} /></div>
          <div><label className="label">Tipo de licencia *</label><select className="input" {...register("licenseType")}><option value="">Selecciona</option><option>AUTOMOVILISTA - A</option><option>CHOFER - C</option><option>MOTOCICLISTA - M</option></select></div>
          <div><label className="label">Vigencia *</label><select className="input" {...register("validity")}><option value="">Selecciona</option><option>3 AÑOS $720</option><option>5 AÑOS $770</option></select></div>
          <div className="md:col-span-2 space-y-1"><label className="label">¿Aceptas que la licencia lleve domicilio del estado de Guerrero? *</label><p className="text-xs text-slate-600">Como la licencia se tramita en Guerrero, se pide que salga con un domicilio de aquí. En caso de no tener domicilio de Guerrero, la licencia saldrá con el domicilio del ayuntamiento donde se realiza el trámite.</p><label className="text-sm"><input type="checkbox" {...register("acceptsGuerreroAddress")} /> Sí, confirmo que acepto que la licencia lleve domicilio del estado de Guerrero.</label></div>
          <div className="md:col-span-2"><label className="label">Alergias / Restricciones</label><textarea className="input" {...register("allergiesRestrictions")} /></div>
          <div><label className="label">Tipo de sangre *</label><select className="input" {...register("bloodType")}><option value="">Selecciona</option>{["O-","O+","A-","A+","B-","B+","AB-","AB+","Desconoce"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Nombre de contacto de emergencia *</label><input className="input" {...register("emergencyContactName")} /></div>
          <div><label className="label">Teléfono contacto de emergencia *</label><input className="input" {...register("emergencyContactPhone")} /></div>
        </div>

        <div className="card grid md:grid-cols-2 gap-3">
          <h2 className="md:col-span-2 font-semibold">Datos de envío</h2>
          <div><label className="label">Nombre destinatario *</label><input className="input" {...register("recipientName")} /></div>
          <div><label className="label">Teléfono destinatario *</label><input className="input" {...register("recipientPhone")} /></div>
        </div>

        <DhlMap onConfirm={(v) => setValue("dhlLocation", v as any)} />
        <ImageUploader title="1. Foto de la persona" subtitle="Toma la foto con buena luz, de frente y sin lentes." emptyText="Aún no hay foto" useText="Usar esta foto" changeText="Cambiar foto" lensControl onConfirm={(v) => setValue("personPhoto", v as any)} />
        <ImageUploader title="2. Foto de identificación" subtitle="Toma foto clara de la identificación o súbela desde tus archivos." emptyText="Aún no hay foto" useText="Usar" changeText="Cambiar" onConfirm={(v) => setValue("idPhoto", v as any)} />
        <SignatureField onConfirm={(v) => setValue("signature", v as any)} />

        <div className="card">
          <button disabled={loading} className="px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold">Enviar por WhatsApp</button>
          <p className="text-xs mt-2">PRESIONA EN "ENVIAR POR WHATSAPP", TU SOLICITUD SERÁ ASIGNADA AL NUM: 722 560 09 05 DONDE CONTINUARÁS TU TRÁMITE CON ATENCIÓN PERSONALIZADA.</p>
          {loading && <p className="text-sm mt-2">Procesando imagen, por favor espera...</p>}
          {Object.keys(errors).length > 0 && <p className="error">Revisa los campos requeridos.</p>}
        </div>
      </form>
      <a href="/operators/login" className="text-sm underline">Acceso operadores</a>
    </main>
  );
}
