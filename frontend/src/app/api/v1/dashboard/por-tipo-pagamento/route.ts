import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['l.ativo = true', 'l.usuario_id = $1'];
  const values: any[] = [user.id];
  let idx = 2;

  if (de) {
    conditions.push(`l.data_evento >= $${idx++}`);
    values.push(de);
  }
  if (ate) {
    conditions.push(`l.data_evento <= $${idx++}`);
    values.push(ate);
  }

  const rows = await query<any>(
    `SELECT tp.nome, SUM(l.valor) as valor, COUNT(*) as quantidade
    FROM lancamentos l
    LEFT JOIN tipos_pagamento tp ON tp.id = l.tipo_pagamento_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY tp.nome
    ORDER BY SUM(l.valor) DESC`,
    values,
  );

  return NextResponse.json(
    rows.map((r) => ({
      nome: r.nome,
      valor: parseFloat(r.valor),
      quantidade: parseInt(r.quantidade),
    })),
  );
}
