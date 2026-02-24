import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound, badRequest } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const existing = await queryOne<any>('SELECT * FROM tipos_pagamento WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Tipo de pagamento não encontrado');

  const { searchParams } = new URL(request.url);
  const tipoParam = searchParams.get('tipo');

  if (tipoParam !== 'receita' && tipoParam !== 'despesa') {
    return badRequest('Parâmetro tipo deve ser "receita" ou "despesa"');
  }

  const coluna = tipoParam === 'receita' ? 'padrao_receita' : 'padrao_despesa';

  // Remove padrão atual
  await query(`UPDATE tipos_pagamento SET ${coluna} = false WHERE ${coluna} = true AND ativo = true`);

  // Define novo padrão
  const row = await queryOne(
    `UPDATE tipos_pagamento SET ${coluna} = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [params.id],
  );
  return NextResponse.json(row);
}
