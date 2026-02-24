import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound, badRequest } from '@/lib/auth';

function validateModalidade(modalidade: string, parcelas: number): string | null {
  if (modalidade === 'a_vista' && parcelas !== 1) {
    return 'Pagamento à vista deve ter exatamente 1 parcela';
  }
  if (modalidade === 'a_prazo' && parcelas <= 1) {
    return 'Pagamento a prazo deve ter mais de 1 parcela';
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const row = await queryOne('SELECT * FROM tipos_pagamento WHERE id = $1 AND ativo = true', [params.id]);
  if (!row) return notFound('Tipo de pagamento não encontrado');
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const existing = await queryOne<any>('SELECT * FROM tipos_pagamento WHERE id = $1 AND ativo = true', [params.id]);
    if (!existing) return notFound('Tipo de pagamento não encontrado');

    const body = await request.json();

    const modalidade = body.modalidade ?? existing.modalidade;
    const parcelas = body.parcelas ?? existing.parcelas;
    const error = validateModalidade(modalidade, parcelas);
    if (error) return badRequest(error);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of ['nome', 'descricao', 'modalidade', 'parcelas', 'taxa', 'aplicavel_receita', 'aplicavel_despesa']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) return NextResponse.json(existing);

    fields.push(`updated_at = NOW()`);
    values.push(params.id);

    const row = await queryOne(
      `UPDATE tipos_pagamento SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
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

  const existing = await queryOne('SELECT * FROM tipos_pagamento WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Tipo de pagamento não encontrado');

  const row = await queryOne(
    'UPDATE tipos_pagamento SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [params.id],
  );
  return NextResponse.json(row);
}
