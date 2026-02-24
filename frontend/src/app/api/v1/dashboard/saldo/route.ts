import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['ativo = true'];
  const values: any[] = [];
  let idx = 1;

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
      TO_CHAR(data_evento, 'YYYY-MM-DD') as data,
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
    FROM lancamentos
    WHERE ${conditions.join(' AND ')}
    GROUP BY TO_CHAR(data_evento, 'YYYY-MM-DD')
    ORDER BY TO_CHAR(data_evento, 'YYYY-MM-DD') ASC`,
    values,
  );

  let acumulado = 0;
  return NextResponse.json(
    rows.map((r) => {
      acumulado += parseFloat(r.saldo);
      return {
        data: r.data,
        saldo: acumulado,
      };
    }),
  );
}
