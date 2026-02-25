import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const de = searchParams.get('de') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const ate = searchParams.get('ate') || `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

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
  const loja_id = searchParams.get('loja_id');
  if (loja_id) {
    conditions.push(`l.loja_id = $${idx++}`);
    values.push(loja_id);
  }

  const rows = await query<any>(
    `SELECT l.id, l.tipo, l.descricao, l.data_evento, l.valor, l.taxa,
      row_to_json(o) as origem,
      row_to_json(d) as destino,
      row_to_json(e) as etiqueta,
      row_to_json(tp) as tipo_pagamento,
      row_to_json(lo) as loja
    FROM lancamentos l
    LEFT JOIN origens o ON o.id = l.origem_id
    LEFT JOIN destinos d ON d.id = l.destino_id
    LEFT JOIN etiquetas e ON e.id = l.etiqueta_id
    LEFT JOIN tipos_pagamento tp ON tp.id = l.tipo_pagamento_id
    LEFT JOIN lojas lo ON lo.id = l.loja_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.data_evento DESC, l.created_at DESC`,
    values,
  );

  let receitas_bruto = 0, receitas_taxa = 0, receitas_liquido = 0;
  let despesas_bruto = 0, despesas_taxa = 0, despesas_liquido = 0;

  const itens = rows.map((r: any) => {
    const valor_bruto = parseFloat(r.valor);
    const taxa = parseFloat(r.taxa) || 0;
    const valor_taxa = valor_bruto * taxa / 100;
    const valor_liquido = r.tipo === 'receita'
      ? valor_bruto - valor_taxa
      : valor_bruto + valor_taxa;

    if (r.tipo === 'receita') {
      receitas_bruto += valor_bruto;
      receitas_taxa += valor_taxa;
      receitas_liquido += valor_liquido;
    } else {
      despesas_bruto += valor_bruto;
      despesas_taxa += valor_taxa;
      despesas_liquido += valor_liquido;
    }

    return {
      id: r.id,
      tipo: r.tipo,
      descricao: r.descricao,
      data_evento: r.data_evento,
      valor_bruto,
      taxa,
      valor_taxa: Math.round(valor_taxa * 100) / 100,
      valor_liquido: Math.round(valor_liquido * 100) / 100,
      origem: r.origem,
      destino: r.destino,
      etiqueta: r.etiqueta,
      tipo_pagamento: r.tipo_pagamento,
      loja: r.loja,
    };
  });

  return NextResponse.json({
    itens,
    totais: {
      receitas_bruto: Math.round(receitas_bruto * 100) / 100,
      receitas_taxa: Math.round(receitas_taxa * 100) / 100,
      receitas_liquido: Math.round(receitas_liquido * 100) / 100,
      despesas_bruto: Math.round(despesas_bruto * 100) / 100,
      despesas_taxa: Math.round(despesas_taxa * 100) / 100,
      despesas_liquido: Math.round(despesas_liquido * 100) / 100,
    },
  });
}
