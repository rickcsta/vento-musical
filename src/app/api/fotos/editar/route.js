import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { del } from "@vercel/blob";

async function uploadToBlob(req, file) {
  const form = new FormData();
  form.append("file", file);

  const origin = req.headers.get("origin");

  const uploadRes = await fetch(`${origin}/api/upload`, {
    method: "POST",
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error("Erro ao enviar imagem para o Blob");
  }

  const data = await uploadRes.json();
  return data.url;
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const titulo = form.get("titulo");
    const descricao = form.get("descricao");
    const data_evento = form.get("data_evento");
    const evento_id = Number(form.get("evento_id"));
    const file = form.get("file");

    let url_img = null;

    if (file && file.size > 0) {
      url_img = await uploadToBlob(req, file);
    }

    const query = `
      INSERT INTO foto (titulo, descricao, data_evento, evento_id, url_img)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [titulo, descricao, data_evento, evento_id, url_img];
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error("Erro ao criar foto:", error);
    return NextResponse.json({ error: "Erro ao criar foto" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const form = await req.formData();

    const id = Number(form.get("id"));
    const titulo = form.get("titulo");
    const descricao = form.get("descricao");
    const data_evento = form.get("data_evento");
    const evento_id = Number(form.get("evento_id"));
    const file = form.get("file");

    const fotoQuery = `SELECT * FROM foto WHERE id = $1`;
    const { rows: oldRows } = await pool.query(fotoQuery, [id]);

    if (oldRows.length === 0) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }

    let url_img = oldRows[0].url_img;

    if (file && file.size > 0) {
      url_img = await uploadToBlob(req, file);
    }

    const updateQuery = `
      UPDATE foto
      SET titulo = $1,
          descricao = $2,
          data_evento = $3,
          evento_id = $4,
          url_img = $5
      WHERE id = $6
      RETURNING *;
    `;

    const values = [titulo, descricao, data_evento, evento_id, url_img, id];
    const { rows } = await pool.query(updateQuery, values);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error("Erro ao editar foto:", error);
    return NextResponse.json({ error: "Erro ao editar foto" }, { status: 500 });
  }

  
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não enviado" }, { status: 400 });
    }

    // 1. Buscar a foto no banco para pegar a URL
    const foto = await pool.query("SELECT url_img FROM foto WHERE id = $1", [id]);

    if (foto.rows.length === 0) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }

    const blobUrl = foto.rows[0].url_img;

    // 2. Apagar do banco
    await pool.query("DELETE FROM foto WHERE id = $1", [id]);

    // 3. APAGAR DO BLOB DA VERCEL
    if (blobUrl) {
      await del(blobUrl); // <-- APAGA o arquivo definitivamente
    }

    return NextResponse.json({ message: "Foto apagada com sucesso!" });

  } catch (error) {
    console.error("Erro ao deletar foto:", error);
    return NextResponse.json({ error: "Erro ao deletar foto" }, { status: 500 });
  }
}