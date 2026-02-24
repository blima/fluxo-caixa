import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound, badRequest, conflict, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const row = await queryOne(
    'SELECT id, nome, nome_usuario, email, ativo, created_at, updated_at FROM users WHERE id = $1 AND ativo = true',
    [params.id],
  );
  if (!row) return notFound('Usuário não encontrado');
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const existing = await queryOne('SELECT * FROM users WHERE id = $1 AND ativo = true', [params.id]);
    if (!existing) return notFound('Usuário não encontrado');

    const body = await request.json();

    if (body.email) {
      const dup = await queryOne('SELECT id FROM users WHERE email = $1 AND id != $2', [body.email, params.id]);
      if (dup) return conflict('Email já cadastrado');
    }

    if (body.nome_usuario) {
      const dup = await queryOne('SELECT id FROM users WHERE nome_usuario = $1 AND id != $2', [body.nome_usuario, params.id]);
      if (dup) return conflict('Nome de usuário já cadastrado');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of ['nome', 'nome_usuario', 'email']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (body.senha) {
      const senha_hash = await hashPassword(body.senha);
      fields.push(`senha_hash = $${idx++}`);
      values.push(senha_hash);
    }

    if (fields.length === 0) return NextResponse.json(existing);

    fields.push(`updated_at = NOW()`);
    values.push(params.id);

    const row = await queryOne(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, nome, nome_usuario, email, ativo, created_at, updated_at`,
      values,
    );
    return NextResponse.json(row);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  if (user.id === params.id) {
    return badRequest('Não é possível excluir o próprio usuário');
  }

  const existing = await queryOne('SELECT * FROM users WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Usuário não encontrado');

  const row = await queryOne(
    'UPDATE users SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING id, nome, nome_usuario, email, ativo, created_at, updated_at',
    [params.id],
  );
  return NextResponse.json(row);
}
