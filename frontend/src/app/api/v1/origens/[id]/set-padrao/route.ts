import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const existing = await queryOne('SELECT * FROM origens WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Origem não encontrada');

  await query('UPDATE origens SET padrao = false WHERE padrao = true AND ativo = true');
  const row = await queryOne(
    'UPDATE origens SET padrao = true, updated_at = NOW() WHERE id = $1 RETURNING *',
    [params.id],
  );
  return NextResponse.json(row);
}
