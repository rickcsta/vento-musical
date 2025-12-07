import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT 
        id,
        titulo,
        descricao,
        datahora_evento,
        local,
        link_drive
      FROM evento
      ORDER BY datahora_evento DESC NULLS LAST, titulo ASC
    `);

    return NextResponse.json(res.rows);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    return NextResponse.json(
      { error: "Erro ao buscar eventos", details: err.message },
      { status: 500 }
    );
  }
}