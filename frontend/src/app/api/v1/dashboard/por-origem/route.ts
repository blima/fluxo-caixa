import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['l.ativo = true', "l.tipo = 'receita'", 'l.origem_id IS NOT NULL'];
  const values: any[] = [];
  let idx = 1;

  if (de) {
    conditions.push(`l.data_evento >= $${idx++}`);
    values.push(de);
  }
  if (ate) {
    conditions.push(`l.data_evento <= $${idx++}`);
    values.push(ate);
  }

  const rows = await query<any>(
    `SELECT o.nome, SUM(l.valor) as valor
    FROM lancamentos l
    LEFT JOIN origens o ON o.id = l.origem_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY o.nome
    ORDER BY SUM(l.valor) DESC`,
    values,
  );

  return NextResponse.json(
    rows.map((r) => ({
      nome: r.nome,
      valor: parseFloat(r.valor),
    })),
  );
}
