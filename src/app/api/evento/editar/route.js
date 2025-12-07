import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { titulo, descricao, datahora_evento, local, link_drive } = body;

    // Validação básica
    if (!titulo || !titulo.trim()) {
      return NextResponse.json(
        { error: "O título do evento é obrigatório" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    const res = await client.query(
      `INSERT INTO evento (titulo, descricao, datahora_evento, local, link_drive) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, titulo, descricao, datahora_evento, local, link_drive`,
      [
        titulo.trim() || null,
        descricao?.trim(), 
        datahora_evento || null,
        local?.trim(),
        link_drive?.trim() || null
      ]
    );

    client.release();

    return NextResponse.json(res.rows[0], { status: 201 });

  } catch (error) {
    console.error("Erro POST evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, titulo, descricao, datahora_evento, local, link_drive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

    if (!titulo || !titulo.trim()) {
      return NextResponse.json(
        { error: "O título do evento é obrigatório" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    // Verifica se o evento existe
    const eventoExistente = await client.query(
      `SELECT id FROM evento WHERE id = $1`,
      [id]
    );

    if (eventoExistente.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    const res = await client.query(
      `UPDATE evento 
       SET titulo = $1,
           descricao = $2,
           datahora_evento = $3,
           local = $4,
           link_drive = $5
       WHERE id = $6
       RETURNING id, titulo, descricao, datahora_evento, local, link_drive`,
      [
        titulo.trim() || null,
        descricao?.trim(),
        datahora_evento || null,
        local?.trim(),
        link_drive?.trim() || null,
        id
      ]
    );

    client.release();

    return NextResponse.json(res.rows[0], { status: 200 });

  } catch (error) {
    console.error("Erro PUT evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    // Verifica se o evento existe
    const eventoExistente = await client.query(
      `SELECT id FROM evento WHERE id = $1`,
      [id]
    );

    if (eventoExistente.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se existem fotos associadas ao evento
    const fotosAssociadas = await client.query(
      `SELECT COUNT(*) as count FROM foto WHERE evento_id = $1`,
      [id]
    );

    const quantidadeFotos = parseInt(fotosAssociadas.rows[0].count);

    if (quantidadeFotos > 0) {
      // Se houver fotos, remove apenas a associação (evento_id = NULL)
      await client.query(
        `UPDATE foto SET evento_id = NULL WHERE evento_id = $1`,
        [id]
      );
      
      // Deleta o evento
      await client.query(`DELETE FROM evento WHERE id = $1`, [id]);
      
      client.release();
      
      return NextResponse.json(
        { 
          message: "Evento excluído com sucesso",
          warning: `${quantidadeFotos} foto(s) foram desassociadas deste evento`
        },
        { status: 200 }
      );
    } else {
      // Se não houver fotos, deleta normalmente
      await client.query(`DELETE FROM evento WHERE id = $1`, [id]);
      client.release();
      
      return NextResponse.json(
        { message: "Evento excluído com sucesso" },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Erro DELETE evento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir evento", details: error.message },
      { status: 500 }
    );
  }
}