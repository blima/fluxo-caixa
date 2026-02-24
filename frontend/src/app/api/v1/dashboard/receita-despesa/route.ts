import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['ativo = true', 'usuario_id = $1'];
  const values: any[] = [user.id];
  let idx = 2;

  if (de) {
    conditions.push(`data_evento >= $${idx++}`);
    values.push(de);
  }
  if (ate) {
    conditions.push(`data_evento <= $${idx++}`);
    values.push(ate);
  }

  const rows = await query<any>(
    `SELECT
      TO_CHAR(data_evento, 'YYYY-MM') as mes,
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as receitas,
      COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as despesas
    FROM lancamentos
    WHERE ${conditions.join(' AND ')}
    GROUP BY TO_CHAR(data_evento, 'YYYY-MM')
    ORDER BY TO_CHAR(data_evento, 'YYYY-MM') ASC`,
    values,
  );

  return NextResponse.json(
    rows.map((r) => ({
      mes: r.mes,
      receitas: parseFloat(r.receitas),
      despesas: parseFloat(r.despesas),
    })),
  );
}
