import { NextResponse } from 'next/server'
import pool from "@/lib/db"

export async function POST(request) {
  try {
    const { email, senha } = await request.json()
    const pacient = await pool.connect()
    const result = await pacient.query(
      'SELECT * FROM usuario_admin WHERE email = $1 AND senha = $2',
      [email, senha]
    )

    const user = result.rows[0]

    return NextResponse.json(
      { id: user.id },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao logar admnistrador:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}