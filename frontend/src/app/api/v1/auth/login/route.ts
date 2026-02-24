import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { statusCode: 400, message: 'Email e senha são obrigatórios' },
        { status: 400 },
      );
    }

    const user = await queryOne<{
      id: string;
      nome: string;
      email: string;
      senha_hash: string;
    }>('SELECT id, nome, email, senha_hash FROM users WHERE email = $1 AND ativo = true', [email]);

    if (!user) {
      return NextResponse.json(
        { statusCode: 401, message: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const isMatch = await comparePassword(senha, user.senha_hash);
    if (!isMatch) {
      return NextResponse.json(
        { statusCode: 401, message: 'Credenciais inválidas' },
        { status: 401 },
      );
    }

    const access_token = signToken({ sub: user.id, email: user.email });
    return NextResponse.json({
      access_token,
      user: { id: user.id, nome: user.nome, email: user.email },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
