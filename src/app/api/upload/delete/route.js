import { del } from '@vercel/blob';

export async function DELETE(req) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL é obrigatória' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deleta o arquivo do blob
    await del(url);

    return new Response(
      JSON.stringify({ message: 'Arquivo deletado com sucesso' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao deletar arquivo' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}