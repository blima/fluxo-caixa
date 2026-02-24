import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword, signToken, conflict, badRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return badRequest('Nome, email e senha são obrigatórios');
    }

    const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (exists) {
      return conflict('Email já cadastrado');
    }

    const senha_hash = await hashPassword(senha);
    const user = await queryOne<{ id: string; nome: string; email: string }>(
      'INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senha_hash],
    );

    const access_token = signToken({ sub: user!.id, email: user!.email });
    return NextResponse.json({
      access_token,
      user: { id: user!.id, nome: user!.nome, email: user!.email },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
