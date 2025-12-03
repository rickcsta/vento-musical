import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req) {
  try {
    const body = await req.json();
    const { sobre_nos, equipe } = body;

    const client = await pool.connect();

    // Atualiza SOBRE_NOS
    if (sobre_nos) {
      const fields = [];
      const values = [];
      let i = 1;

      if (sobre_nos.titulo !== undefined) { fields.push(`titulo = $${i++}`); values.push(sobre_nos.titulo); }
      if (sobre_nos.missao !== undefined) { fields.push(`missao = $${i++}`); values.push(sobre_nos.missao); }
      if (sobre_nos.descricao !== undefined) { fields.push(`descricao = $${i++}`); values.push(sobre_nos.descricao); }

      values.push(sobre_nos.id);

      if (fields.length > 0) {
        await client.query(`UPDATE sobre_nos SET ${fields.join(", ")} WHERE id = $${i};`, values);
      }
    }

    // Atualiza equipe
    if (Array.isArray(equipe)) {
      await client.query(`DELETE FROM membros_equipe`);

      for (const membro of equipe) {
        if (!membro.nome || !membro.cargo) continue;
        await client.query(
          `INSERT INTO membros_equipe (nome, cargo, foto_url) VALUES ($1, $2, $3)`,
          [membro.nome, membro.cargo, membro.fotoUrl || null]
        );
      }
    }

    client.release();

    return NextResponse.json({ message: "Atualizado com sucesso!" }, { status: 200 });

  } catch (error) {
    console.error("Erro PUT:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
