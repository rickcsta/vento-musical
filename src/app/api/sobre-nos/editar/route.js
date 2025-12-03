import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { del } from '@vercel/blob';

export async function PUT(req) {
  let client;
  try {
    const body = await req.json();
    const { sobre_nos, equipe } = body;

    client = await pool.connect();

    // 1. Primeiro, buscar os membros atuais para comparar
    const membrosAtuais = await client.query(
      `SELECT id, nome, cargo, foto_url FROM membros_equipe`
    );
    
    // 2. Identificar fotos que serão removidas
    const fotosParaExcluir = [];
    
    // Comparar membros atuais com os novos
    for (const membroAtual of membrosAtuais.rows) {
      const membroContinua = equipe?.some(membroNovo => 
        membroAtual.nome === membroNovo.nome && 
        membroAtual.cargo === membroNovo.cargo
      );
      
      // Se o membro não está mais na nova lista E tem foto
      if (!membroContinua && membroAtual.foto_url) {
        fotosParaExcluir.push(membroAtual.foto_url);
      }
    }

    // 3. Atualiza SOBRE_NOS
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

    // 4. Limpa a tabela de membros
    await client.query(`DELETE FROM membros_equipe`);

    // 5. Insere os novos membros
    if (Array.isArray(equipe)) {
      for (const membro of equipe) {
        if (!membro.nome || !membro.cargo) continue;
        await client.query(
          `INSERT INTO membros_equipe (nome, cargo, foto_url) VALUES ($1, $2, $3)`,
          [membro.nome, membro.cargo, membro.fotoUrl || null]
        );
      }
    }

    await client.query('COMMIT');
    client.release();

    // 6. Excluir fotos do blob (assíncrono, não bloqueia a resposta)
    if (fotosParaExcluir.length > 0) {
      fotosParaExcluir.forEach(async (url) => {
        try {
          await del(url);
          console.log(`Foto excluída: ${url}`);
        } catch (error) {
          console.error(`Erro ao excluir foto ${url}:`, error);
        }
      });
    }

    return NextResponse.json({ 
      message: "Atualizado com sucesso!",
      fotosExcluidas: fotosParaExcluir.length 
    }, { status: 200 });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    console.error("Erro PUT:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}