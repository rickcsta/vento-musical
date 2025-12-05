import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// No App Router, use export dinâmico runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configuração do bodyParser
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ 
        error: "Nenhum arquivo enviado" 
      }, { status: 400 });
    }

    // Validações
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Arquivo muito grande. Máximo: 5MB" 
      }, { status: 400 });
    }

    // Tipos permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg' // Adicionando também jpg
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF" 
      }, { status: 400 });
    }

    // Gera um nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop().toLowerCase();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `equipe/${timestamp}_${safeName}`;

    // Upload para Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    console.log(`Upload realizado: ${filename} (${file.size} bytes)`);

    return NextResponse.json({ 
      url: blob.url,
      filename: filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error("Erro no upload:", error);
    
    // Mensagens de erro mais específicas
    let errorMessage = "Erro ao enviar imagem";
    if (error.message.includes("network")) {
      errorMessage = "Erro de conexão. Verifique sua internet";
    } else if (error.message.includes("storage")) {
      errorMessage = "Erro no armazenamento. Tente novamente";
    } else if (error.message.includes("BLOB_STORE_NOT_FOUND")) {
      errorMessage = "Blob store não configurado. Verifique as configurações do Vercel Blob";
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Opcional: Adicione um endpoint GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: "API de upload funcionando",
    timestamp: new Date().toISOString()
  });
}