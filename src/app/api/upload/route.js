import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs"; // IMPORTANTE no Vercel!

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Converter file (Web API) para buffer Node
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });

  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao enviar imagem" }, { status: 500 });
  }
}
