import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound, badRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const row = await queryOne('SELECT * FROM lojas WHERE id = $1', [params.id]);
  if (!row) return notFound('Loja não encontrada');
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const existing = await queryOne<any>('SELECT * FROM lojas WHERE id = $1', [params.id]);
  if (!existing) return notFound('Loja não encontrada');

  const body = await request.json();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (body.nome !== undefined) {
    if (body.nome.trim().length < 2) return badRequest('Nome deve ter pelo menos 2 caracteres');
    fields.push(`nome = $${idx++}`);
    values.push(body.nome.trim());
  }
  if (body.matriz !== undefined) {
    if (body.matriz) {
      await query('UPDATE lojas SET matriz = false WHERE matriz = true AND id != $1', [params.id]);
    }
    fields.push(`matriz = $${idx++}`);
    values.push(body.matriz);
  }
  if (body.ativo !== undefined) {
    fields.push(`ativo = $${idx++}`);
    values.push(body.ativo);
  }

  if (fields.length === 0) {
    return NextResponse.json(existing);
  }

  fields.push('updated_at = NOW()');
  values.push(params.id);

  const row = await queryOne(
    `UPDATE lojas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return NextResponse.json(row);
}
