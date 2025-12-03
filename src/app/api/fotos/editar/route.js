import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { titulo, descricao, data_evento, url_img, evento_id } = await req.json();
    const res = await pool.query(
      `INSERT INTO foto (titulo, descricao, data_evento, url_img, evento_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titulo, descricao || "", data_evento, url_img, evento_id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar foto" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, titulo, descricao, data_evento, url_img, evento_id } = await req.json();
    const res = await pool.query(
      `UPDATE foto
       SET titulo=$1, descricao=$2, data_evento=$3, url_img=$4, evento_id=$5
       WHERE id=$6 RETURNING *`,
      [titulo, descricao || "", data_evento, url_img, evento_id, id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar foto" }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await pool.query("DELETE FROM foto WHERE id=$1", [id]);
    return NextResponse.json({ message: "Foto deletada" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao deletar foto" }, { status: 500 });
  }
}
