import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
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
  const loja_id = searchParams.get('loja_id');
  if (loja_id) {
    conditions.push(`loja_id = $${idx++}`);
    values.push(loja_id);
  }

  const row = await queryOne<any>(
    `SELECT
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
      COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
      COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo,
      COUNT(*) as total_lancamentos
    FROM lancamentos
    WHERE ${conditions.join(' AND ')}`,
    values,
  );

  return NextResponse.json({
    total_receitas: parseFloat(row.total_receitas),
    total_despesas: parseFloat(row.total_despesas),
    saldo: parseFloat(row.saldo),
    total_lancamentos: parseInt(row.total_lancamentos),
  });
}
