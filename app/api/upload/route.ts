import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

const allowed = ["image/jpeg", "image/png", "image/webp"];
const max = Number(process.env.MAX_FILE_SIZE_MB || 8) * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const source = String(formData.get("source") || "file");
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (file.size > max) return NextResponse.json({ error: "Archivo excede tamaño" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}`, mime: file.type, size: file.size, source });
}
