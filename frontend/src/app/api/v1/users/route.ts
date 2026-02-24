import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, badRequest, conflict, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const rows = await query(
    'SELECT id, nome, email, ativo, created_at, updated_at FROM users WHERE ativo = true ORDER BY nome ASC',
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return badRequest('Nome, email e senha são obrigatórios');
    }

    const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (exists) return conflict('Email já cadastrado');

    const senha_hash = await hashPassword(senha);
    const row = await queryOne(
      'INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, ativo, created_at, updated_at',
      [nome, email, senha_hash],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
