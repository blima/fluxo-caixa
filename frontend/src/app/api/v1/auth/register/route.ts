import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword, signToken, conflict, badRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nome, nome_usuario, email, senha } = await request.json();

    if (!nome || !nome_usuario || !email || !senha) {
      return badRequest('Nome, nome de usuário, email e senha são obrigatórios');
    }

    const existsEmail = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existsEmail) {
      return conflict('Email já cadastrado');
    }

    const existsUser = await queryOne('SELECT id FROM users WHERE nome_usuario = $1', [nome_usuario]);
    if (existsUser) {
      return conflict('Nome de usuário já cadastrado');
    }

    const senha_hash = await hashPassword(senha);
    const user = await queryOne<{ id: string; nome: string; nome_usuario: string; email: string }>(
      'INSERT INTO users (nome, nome_usuario, email, senha_hash) VALUES ($1, $2, $3, $4) RETURNING id, nome, nome_usuario, email',
      [nome, nome_usuario, email, senha_hash],
    );

    const access_token = signToken({ sub: user!.id, email: user!.email });
    return NextResponse.json({
      access_token,
      user: { id: user!.id, nome: user!.nome, nome_usuario: user!.nome_usuario, email: user!.email },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
