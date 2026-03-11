import type { ApplicationInput } from "./validations";

export function buildWhatsappMessage(data: ApplicationInput) {
  return [
    "Nueva solicitud de trámite",
    `Nombre completo: ${data.firstName} ${data.lastName}`,
    `CURP: ${data.curp}`,
    `Teléfono: ${data.whatsappPhone}`,
    `Tipo de licencia: ${data.licenseType}`,
    `Vigencia: ${data.validity}`,
    `Aceptación domicilio Guerrero: ${data.acceptsGuerreroAddress ? "Sí" : "No"}`,
    `Alergias / Restricciones: ${data.allergiesRestrictions || "N/A"}`,
    `Tipo de sangre: ${data.bloodType}`,
    `Contacto emergencia: ${data.emergencyContactName} (${data.emergencyContactPhone})`,
    `Destinatario: ${data.recipientName} (${data.recipientPhone})`,
    `Sucursal DHL: ${data.dhlLocation.name}`,
    `Dirección completa de sucursal: ${data.dhlLocation.fullAddress}`
  ].join("\n");
}

export function whatsappUrl(message: string, target: string) {
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}
