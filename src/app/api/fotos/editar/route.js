import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { del } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { titulo, descricao, data_evento, evento_id, url_img } = body;

    console.log("Dados recebidos POST:", { titulo, url_img, evento_id });

    // Validação básica
    if (!titulo || !url_img) {
      return NextResponse.json(
        { error: "Título e imagem são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    const res = await client.query(
      `INSERT INTO foto (titulo, descricao, data_evento, evento_id, url_img) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, titulo, descricao, data_evento, evento_id, url_img`,
      [titulo, descricao, data_evento || null, evento_id || null, url_img]
    );

    client.release();

    return NextResponse.json(res.rows[0], { status: 201 });

  } catch (error) {
    console.error("Erro POST foto:", error);
    return NextResponse.json(
      { error: "Erro ao criar foto", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, titulo, descricao, data_evento, evento_id, url_img } = body;

    console.log("Dados recebidos PUT:", { id, titulo, url_img });

    if (!id) {
      return NextResponse.json(
        { error: "ID da foto é obrigatório" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    // Busca a foto atual para verificar se tem imagem diferente
    const fotoAtual = await client.query(
      `SELECT url_img FROM foto WHERE id = $1`,
      [id]
    );

    // Se houver nova imagem e a atual for diferente, deleta a antiga do blob
    if (url_img && fotoAtual.rows[0]?.url_img && fotoAtual.rows[0].url_img !== url_img) {
      try {
        await del(fotoAtual.rows[0].url_img);
        console.log("Imagem antiga deletada do blob");
      } catch (blobError) {
        console.error("Erro ao deletar imagem antiga do blob:", blobError);
      }
    }

    const res = await client.query(
      `UPDATE foto 
       SET titulo = COALESCE($1, titulo),
           descricao = COALESCE($2, descricao),
           data_evento = COALESCE($3, data_evento),
           evento_id = COALESCE($4, evento_id),
           url_img = COALESCE($5, url_img)
       WHERE id = $6
       RETURNING id, titulo, descricao, data_evento, evento_id, url_img`,
      [
        titulo || null,
        descricao || null,
        data_evento || null,
        evento_id || null,
        url_img || null,
        id
      ]
    );

    client.release();

    return NextResponse.json(res.rows[0], { status: 200 });

  } catch (error) {
    console.error("Erro PUT foto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar foto", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    console.log("Deletando foto ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID da foto é obrigatório" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    // Busca a foto para obter a URL da imagem
    const foto = await client.query(
      `SELECT url_img FROM foto WHERE id = $1`,
      [id]
    );

    if (foto.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: "Foto não encontrada" },
        { status: 404 }
      );
    }

    const url_img = foto.rows[0].url_img;

    // Deleta do banco de dados
    await client.query(`DELETE FROM foto WHERE id = $1`, [id]);
    client.release();

    // Deleta a imagem do blob (se existir)
    if (url_img) {
      try {
        await del(url_img);
        console.log("Imagem deletada do blob:", url_img);
      } catch (blobError) {
        console.error("Erro ao deletar do blob:", blobError);
        // Continua mesmo se falhar a exclusão do blob
      }
    }

    return NextResponse.json(
      { message: "Foto excluída com sucesso" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro DELETE foto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir foto", details: error.message },
      { status: 500 }
    );
  }
}