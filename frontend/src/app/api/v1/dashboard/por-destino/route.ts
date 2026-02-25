import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['l.ativo = true', "l.tipo = 'despesa'", 'l.destino_id IS NOT NULL'];
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
  const loja_id = searchParams.get('loja_id');
  if (loja_id) {
    conditions.push(`l.loja_id = $${idx++}`);
    values.push(loja_id);
  }

  const rows = await query<any>(
    `SELECT d.nome, SUM(l.valor) as valor
    FROM lancamentos l
    LEFT JOIN destinos d ON d.id = l.destino_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY d.nome
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
