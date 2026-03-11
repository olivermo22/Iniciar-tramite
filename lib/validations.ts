import { z } from "zod";

export const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

export const fileSchema = z.object({
  url: z.string().min(1),
  mime: z.string().min(1),
  size: z.number().positive(),
  source: z.enum(["camera", "file", "drawn", "upload"])
});

const dhlLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  street: z.string().min(1),
  exteriorNumber: z.string().optional().default(""),
  neighborhood: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  fullAddress: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  distanceKm: z.number().optional(),
  schedule: z.string().optional(),
  locationType: z.string().optional()
});

export const applicationSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  curp: z.string().trim().toUpperCase().length(18).regex(CURP_REGEX),
  whatsappPhone: z.string().regex(/^\d{10}$/),
  licenseType: z.enum(["AUTOMOVILISTA - A", "CHOFER - C", "MOTOCICLISTA - M"]),
  validity: z.enum(["3 AÑOS $720", "5 AÑOS $770"]),
  acceptsGuerreroAddress: z.literal(true),
  allergiesRestrictions: z.string().max(250).optional().default(""),
  bloodType: z.enum(["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+", "Desconoce"]),
  emergencyContactName: z.string().trim().min(2),
  emergencyContactPhone: z.string().regex(/^\d{10}$/),
  recipientName: z.string().trim().min(2),
  recipientPhone: z.string().regex(/^\d{10}$/),
  dhlLocation: dhlLocationSchema,
  personPhoto: fileSchema.extend({
    glassesStatus: z.enum(["no", "transparentes", "oscuros"]).refine((v) => v !== "oscuros", "No se permite confirmar foto con lentes oscuros")
  }),
  idPhoto: fileSchema,
  signature: z.object({
    url: z.string().min(1),
    type: z.enum(["upload", "drawn"])
  })
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
