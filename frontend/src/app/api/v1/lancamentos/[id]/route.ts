import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, notFound, badRequest } from '@/lib/auth';

async function findLancamentoWithRelations(id: string) {
  return queryOne(
    `SELECT l.*,
      row_to_json(o) as origem,
      row_to_json(d) as destino,
      row_to_json(e) as etiqueta,
      row_to_json(tp) as tipo_pagamento
    FROM lancamentos l
    LEFT JOIN origens o ON o.id = l.origem_id
    LEFT JOIN destinos d ON d.id = l.destino_id
    LEFT JOIN etiquetas e ON e.id = l.etiqueta_id
    LEFT JOIN tipos_pagamento tp ON tp.id = l.tipo_pagamento_id
    WHERE l.id = $1 AND l.ativo = true`,
    [id],
  );
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const row = await findLancamentoWithRelations(params.id);
  if (!row) return notFound('Lançamento não encontrado');
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const existing = await queryOne<any>(
      'SELECT * FROM lancamentos WHERE id = $1 AND ativo = true',
      [params.id],
    );
    if (!existing) return notFound('Lançamento não encontrado');

    const body = await request.json();

    const tipo = body.tipo ?? existing.tipo;
    const origem_id = body.origem_id !== undefined ? body.origem_id : existing.origem_id;
    const destino_id = body.destino_id !== undefined ? body.destino_id : existing.destino_id;

    if (tipo === 'receita' && !origem_id) {
      return badRequest('Receita deve ter uma origem');
    }
    if (tipo === 'despesa' && !destino_id) {
      return badRequest('Despesa deve ter um destino');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of ['tipo', 'descricao', 'valor', 'data_evento', 'origem_id', 'destino_id', 'etiqueta_id', 'tipo_pagamento_id']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      const row = await findLancamentoWithRelations(params.id);
      return NextResponse.json(row);
    }

    fields.push(`updated_at = NOW()`);
    values.push(params.id);

    await queryOne(
      `UPDATE lancamentos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    const row = await findLancamentoWithRelations(params.id);
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

  const existing = await queryOne('SELECT * FROM lancamentos WHERE id = $1 AND ativo = true', [params.id]);
  if (!existing) return notFound('Lançamento não encontrado');

  const row = await queryOne(
    'UPDATE lancamentos SET ativo = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [params.id],
  );
  return NextResponse.json(row);
}
