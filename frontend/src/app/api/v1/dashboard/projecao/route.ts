import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const meses = parseInt(searchParams.get('meses') || '6');
  const loja_id = searchParams.get('loja_id');

  // Busca lançamentos a_prazo ativos do usuário
  let projecaoConditions = `l.ativo = true AND l.usuario_id = $1 AND tp.modalidade = 'a_prazo'`;
  const projecaoValues: any[] = [user.id];
  if (loja_id) {
    projecaoConditions += ' AND l.loja_id = $2';
    projecaoValues.push(loja_id);
  }

  const lancamentos = await query<any>(
    `SELECT l.tipo, l.valor, l.taxa, l.data_evento, tp.parcelas
     FROM lancamentos l
     JOIN tipos_pagamento tp ON tp.id = l.tipo_pagamento_id
     WHERE ${projecaoConditions}`,
    projecaoValues,
  );

  // Calcula parcelas futuras distribuídas mês a mês
  const projecaoMap: Record<string, { receitas_bruto: number; receitas_liquido: number; despesas_bruto: number; despesas_liquido: number }> = {};

  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  for (const lanc of lancamentos) {
    const valorParcela = parseFloat(lanc.valor) / lanc.parcelas;
    const taxa = parseFloat(lanc.taxa) || 0;
    const valorTaxa = valorParcela * taxa / 100;
    const valorLiquido = lanc.tipo === 'receita'
      ? valorParcela - valorTaxa
      : valorParcela + valorTaxa;

    const dataEvento = new Date(lanc.data_evento);

    for (let i = 0; i < lanc.parcelas; i++) {
      const mesParcela = new Date(dataEvento.getFullYear(), dataEvento.getMonth() + i, 1);
      const mesKey = `${mesParcela.getFullYear()}-${String(mesParcela.getMonth() + 1).padStart(2, '0')}`;

      // Somente parcelas futuras (a partir do mês atual)
      if (mesKey < mesAtual) continue;

      if (!projecaoMap[mesKey]) {
        projecaoMap[mesKey] = { receitas_bruto: 0, receitas_liquido: 0, despesas_bruto: 0, despesas_liquido: 0 };
      }

      if (lanc.tipo === 'receita') {
        projecaoMap[mesKey].receitas_bruto += valorParcela;
        projecaoMap[mesKey].receitas_liquido += valorLiquido;
      } else {
        projecaoMap[mesKey].despesas_bruto += valorParcela;
        projecaoMap[mesKey].despesas_liquido += valorLiquido;
      }
    }
  }

  // Ordenar por mês e limitar
  const resultado = Object.entries(projecaoMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, meses)
    .map(([mes, dados]) => ({
      mes,
      receitas_bruto: Math.round(dados.receitas_bruto * 100) / 100,
      receitas_liquido: Math.round(dados.receitas_liquido * 100) / 100,
      despesas_bruto: Math.round(dados.despesas_bruto * 100) / 100,
      despesas_liquido: Math.round(dados.despesas_liquido * 100) / 100,
    }));

  return NextResponse.json(resultado);
}
