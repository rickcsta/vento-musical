import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    const sobre = await client.query(`
      SELECT id, titulo, missao, descricao
      FROM sobre_nos
      LIMIT 1;
    `);

    const equipe = await client.query(`
      SELECT id, nome, cargo, COALESCE(foto_url, '') AS "fotoUrl"
      FROM membros_equipe
      ORDER BY id ASC;
    `);

    client.release();

    return NextResponse.json({ sobre_nos: sobre.rows[0], equipe: equipe.rows }, { status: 200 });

  } catch (error) {
    console.error("Erro ao buscar informação:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
