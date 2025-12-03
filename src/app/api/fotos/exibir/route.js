import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT f.*, e.titulo AS evento_titulo 
      FROM foto f
      LEFT JOIN evento e ON f.evento_id = e.id
      ORDER BY f.id ASC
    `);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar fotos" }, { status: 500 });
  }
}