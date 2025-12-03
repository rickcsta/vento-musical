
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query('SELECT COUNT(*) as total FROM membros_equipe');
    const total = parseInt(res.rows[0].total);
    
    return NextResponse.json({ total });
  } catch (err) {
    console.error("Erro ao contar membros:", err);
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}