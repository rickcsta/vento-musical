import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    const evento = await client.query(`
      SELECT id, titulo, descricao, data_evento FROM evento;
    `);

    client.release();

    return NextResponse.json({ evento: evento.rows }, { status: 200 }); // Corrigido para retornar todos os eventos

  } catch (error) {
    console.error("Erro ao buscar informações:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
