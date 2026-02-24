import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, badRequest } from '@/lib/auth';

function validateModalidade(modalidade: string, parcelas: number): string | null {
  if (modalidade === 'a_vista' && parcelas !== 1) {
    return 'Pagamento à vista deve ter exatamente 1 parcela';
  }
  if (modalidade === 'a_prazo' && parcelas <= 1) {
    return 'Pagamento a prazo deve ter mais de 1 parcela';
  }
  return null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const rows = await query('SELECT * FROM tipos_pagamento WHERE ativo = true ORDER BY nome ASC');
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { nome, descricao, modalidade, parcelas, taxa, aplicavel_receita, aplicavel_despesa } = await request.json();

    const error = validateModalidade(modalidade, parcelas);
    if (error) return badRequest(error);

    const row = await queryOne(
      'INSERT INTO tipos_pagamento (nome, descricao, modalidade, parcelas, taxa, aplicavel_receita, aplicavel_despesa) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nome, descricao || null, modalidade, parcelas, taxa ?? 0, aplicavel_receita ?? true, aplicavel_despesa ?? true],
    );
    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
