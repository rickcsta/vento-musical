import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT 
        f.id,
        f.url_img AS url,
        f.titulo,
        f.descricao,
        f.data_evento,
        f.evento_id,
        e.titulo AS evento_titulo,
        e.descricao AS evento_descricao,
        e.datahora_evento AS evento_datahora,
        e.local AS evento_local
      FROM foto f
      LEFT JOIN evento e ON f.evento_id = e.id
      ORDER BY 
        CASE 
          WHEN e.datahora_evento IS NOT NULL THEN e.datahora_evento
          WHEN f.data_evento IS NOT NULL THEN f.data_evento
          ELSE '9999-12-31'::timestamp
        END DESC,
        f.id DESC
    `);

    return NextResponse.json(res.rows);
  } catch (err) {
    console.error("Erro ao buscar fotos:", err);
    
    // Versão simplificada que sempre funciona
    try {
      const res = await pool.query(`
        SELECT 
          f.id,
          f.url_img AS url,
          f.titulo,
          f.descricao,
          f.data_evento,
          f.evento_id,
          e.titulo AS evento_titulo,
          e.descricao AS evento_descricao,
          e.datahora_evento AS evento_datahora,
          e.local AS evento_local
        FROM foto f
        LEFT JOIN evento e ON f.evento_id = e.id
        ORDER BY f.id DESC
      `);
      return NextResponse.json(res.rows);
    } catch (error) {
      console.error("Erro na query simplificada:", error);
      return NextResponse.json({ 
        error: "Erro ao buscar fotos",
        details: error.message 
      }, { status: 500 });
    }
  }
}