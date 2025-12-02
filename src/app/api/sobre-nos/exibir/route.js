import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    // Busca sobre nós
    const sobre = await client.query(`
      SELECT id, titulo, missao, descricao
      FROM sobre_nos
      LIMIT 1;
    `);

    // Busca equipe
    const equipe = await client.query(`
      SELECT id, nome, cargo
      FROM membros_equipe
      ORDER BY id ASC;
    `);

    client.release();

    return NextResponse.json(
      {
        sobre_nos: sobre.rows[0],
        equipe: equipe.rows
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro ao buscar informação:", error);
    return NextResponse.json(
      { error: "Erro no servidor" },
      { status: 500 }
    );
  }
}
