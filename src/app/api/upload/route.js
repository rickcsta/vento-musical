import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Nome único da imagem
    const filename = `${Date.now()}-${file.name}`;

    // Envia para o Blob
    const blob = await put(filename, file, {
      access: "public", // permite URL pública
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao enviar imagem" }, { status: 500 });
  }
}
