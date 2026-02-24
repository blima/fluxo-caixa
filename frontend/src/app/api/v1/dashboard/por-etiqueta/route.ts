import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const de = searchParams.get('de');
  const ate = searchParams.get('ate');

  const conditions: string[] = ['l.ativo = true'];
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
    `SELECT e.nome, e.cor, SUM(l.valor) as valor, l.tipo
    FROM lancamentos l
    LEFT JOIN etiquetas e ON e.id = l.etiqueta_id
    WHERE ${conditions.join(' AND ')}
    GROUP BY e.nome, e.cor, l.tipo
    ORDER BY SUM(l.valor) DESC`,
    values,
  );

  return NextResponse.json(
    rows.map((r) => ({
      nome: r.nome,
      cor: r.cor,
      valor: parseFloat(r.valor),
      tipo: r.tipo,
    })),
  );
}
