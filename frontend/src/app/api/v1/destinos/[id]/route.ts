import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const row = await queryOne('SELECT * FROM destinos WHERE id = $1 AND ativo = true', [params.id]);
  if (!row) return notFound('Destino não encontrado');
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const existing = await queryOne('SELECT * FROM destinos WHERE id = $1 AND ativo = true', [params.id]);
    if (!existing) return notFound('Destino não encontrado');

    const body = await request.json();

    if (body.padrao) {
      await query('UPDATE destinos SET padrao = false WHERE padrao = true AND ativo = true');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of ['nome', 'descricao', 'padrao']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) return NextResponse.json(existing);

    fields.push(`updated_at = NOW()`);
    values.push(params.id);

    const row = await queryOne(
      `UPDATE destinos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
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

  const existing = await queryOne('SELECT * FROM destinos WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Destino não encontrado');

  const row = await queryOne(
    'UPDATE destinos SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [params.id],
  );
  return NextResponse.json(row);
}
