import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Use 'edge' runtime para melhor compatibilidade com mobile
export const runtime = 'edge';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validações para mobile
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Somente imagens são permitidas' },
        { status: 400 }
      );
    }

    // Limite maior para mobile (algumas fotos podem ser grandes)
    const maxSize = 10 * 1024 * 1024; // 10MB para mobile
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { 
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
          suggestion: 'Reduza a qualidade da foto no seu celular'
        },
        { status: 400 }
      );
    }

    // Gera nome único com timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Remove caracteres especiais
      .toLowerCase();
    
    const filename = `equipe/${timestamp}-${randomString}-${safeFileName}`;

    // Upload direto para o Vercel Blob (sem conversão para Buffer)
    // O edge runtime aceita File diretamente
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      // Otimizações para mobile
      cacheControlMaxAge: 31536000, // 1 ano
    });

    // Resposta otimizada para mobile
    return NextResponse.json({ 
      success: true,
      url: blob.url,
      size: file.size,
      type: file.type,
      filename: filename
    }, {
      headers: {
        // Headers importantes para mobile
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Erro no upload mobile:', error);
    
    // Mensagens de erro específicas para mobile
    let errorMessage = 'Erro ao enviar imagem';
    let suggestion = 'Tente novamente';
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Problema de conexão';
      suggestion = 'Verifique sua conexão com a internet';
    } else if (error.message.includes('size') || error.message.includes('large')) {
      errorMessage = 'Arquivo muito grande';
      suggestion = 'Tente uma foto com qualidade menor';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        suggestion: suggestion
      },
      { status: 500 }
    );
  }
}

// Adiciona suporte a CORS para mobile
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}