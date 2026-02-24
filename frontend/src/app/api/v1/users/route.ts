import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, badRequest, conflict, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const rows = await query(
    'SELECT id, nome, nome_usuario, email, ativo, created_at, updated_at FROM users WHERE ativo = true ORDER BY nome ASC',
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { nome, nome_usuario, email, senha } = await request.json();

    if (!nome || !nome_usuario || !email || !senha) {
      return badRequest('Nome, nome de usuário, email e senha são obrigatórios');
    }

    const existsEmail = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existsEmail) return conflict('Email já cadastrado');

    const existsUser = await queryOne('SELECT id FROM users WHERE nome_usuario = $1', [nome_usuario]);
    if (existsUser) return conflict('Nome de usuário já cadastrado');

    const senha_hash = await hashPassword(senha);
    const row = await queryOne(
      'INSERT INTO users (nome, nome_usuario, email, senha_hash) VALUES ($1, $2, $3, $4) RETURNING id, nome, nome_usuario, email, ativo, created_at, updated_at',
      [nome, nome_usuario, email, senha_hash],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
