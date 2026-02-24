import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, unauthorized, badRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');
  const etiqueta_id = searchParams.get('etiqueta_id');
  const origem_id = searchParams.get('origem_id');
  const destino_id = searchParams.get('destino_id');

  const conditions: string[] = ['l.ativo = true', `l.usuario_id = $1`];
  const values: any[] = [user.id];
  let idx = 2;

  if (tipo) {
    conditions.push(`l.tipo = $${idx++}`);
    values.push(tipo);
  }
  if (etiqueta_id) {
    conditions.push(`l.etiqueta_id = $${idx++}`);
    values.push(etiqueta_id);
  }
  if (origem_id) {
    conditions.push(`l.origem_id = $${idx++}`);
    values.push(origem_id);
  }
  if (destino_id) {
    conditions.push(`l.destino_id = $${idx++}`);
    values.push(destino_id);
  }
  if (de) {
    conditions.push(`l.data_evento >= $${idx++}`);
    values.push(de);
  }
  if (ate) {
    conditions.push(`l.data_evento <= $${idx++}`);
    values.push(ate);
  }

  const rows = await query(
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
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.data_evento DESC, l.created_at DESC`,
    values,
  );

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const { tipo, descricao, valor, data_evento, origem_id, destino_id, etiqueta_id, tipo_pagamento_id } = body;

    if (tipo === 'receita' && !origem_id) {
      return badRequest('Receita deve ter uma origem');
    }
    if (tipo === 'despesa' && !destino_id) {
      return badRequest('Despesa deve ter um destino');
    }

    const inserted = await queryOne<any>(
      `INSERT INTO lancamentos (tipo, descricao, valor, data_evento, origem_id, destino_id, etiqueta_id, tipo_pagamento_id, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [tipo, descricao, valor, data_evento, origem_id || null, destino_id || null, etiqueta_id, tipo_pagamento_id, user.id],
    );

    const row = await queryOne(
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
      WHERE l.id = $1`,
      [inserted!.id],
    );

    return NextResponse.json(row, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: error.message || 'Erro interno' },
      { status: 500 },
    );
  }
}
