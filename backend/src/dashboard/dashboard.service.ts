import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lancamento } from '../lancamentos/lancamento.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Lancamento)
    private readonly repo: Repository<Lancamento>,
  ) {}

  private baseQuery(de?: string, ate?: string) {
    const qb = this.repo
      .createQueryBuilder('l')
      .where('l.ativo = :ativo', { ativo: true });

    if (de) qb.andWhere('l.data_evento >= :de', { de });
    if (ate) qb.andWhere('l.data_evento <= :ate', { ate });

    return qb;
  }

  async resumo(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.select([
      "COALESCE(SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE 0 END), 0) as total_receitas",
      "COALESCE(SUM(CASE WHEN l.tipo = 'despesa' THEN l.valor ELSE 0 END), 0) as total_despesas",
      "COALESCE(SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE -l.valor END), 0) as saldo",
      'COUNT(*) as total_lancamentos',
    ]);

    const result = await qb.getRawOne();
    return {
      total_receitas: parseFloat(result.total_receitas),
      total_despesas: parseFloat(result.total_despesas),
      saldo: parseFloat(result.saldo),
      total_lancamentos: parseInt(result.total_lancamentos),
    };
  }

  async receitaDespesaMensal(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.select([
      "TO_CHAR(l.data_evento, 'YYYY-MM') as mes",
      "COALESCE(SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE 0 END), 0) as receitas",
      "COALESCE(SUM(CASE WHEN l.tipo = 'despesa' THEN l.valor ELSE 0 END), 0) as despesas",
    ])
      .groupBy("TO_CHAR(l.data_evento, 'YYYY-MM')")
      .orderBy("TO_CHAR(l.data_evento, 'YYYY-MM')", 'ASC');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      mes: r.mes,
      receitas: parseFloat(r.receitas),
      despesas: parseFloat(r.despesas),
    }));
  }

  async porEtiqueta(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.leftJoin('l.etiqueta', 'e')
      .select([
        'e.nome as nome',
        'e.cor as cor',
        'SUM(l.valor) as valor',
        'l.tipo as tipo',
      ])
      .groupBy('e.nome')
      .addGroupBy('e.cor')
      .addGroupBy('l.tipo')
      .orderBy('SUM(l.valor)', 'DESC');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      nome: r.nome,
      cor: r.cor,
      valor: parseFloat(r.valor),
      tipo: r.tipo,
    }));
  }

  async porOrigem(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.leftJoin('l.origem', 'o')
      .select(['o.nome as nome', 'SUM(l.valor) as valor'])
      .where('l.ativo = :ativo', { ativo: true })
      .andWhere("l.tipo = 'receita'")
      .andWhere('l.origem_id IS NOT NULL');

    if (de) qb.andWhere('l.data_evento >= :de', { de });
    if (ate) qb.andWhere('l.data_evento <= :ate', { ate });

    qb.groupBy('o.nome').orderBy('SUM(l.valor)', 'DESC');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      nome: r.nome,
      valor: parseFloat(r.valor),
    }));
  }

  async porDestino(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.leftJoin('l.destino', 'd')
      .select(['d.nome as nome', 'SUM(l.valor) as valor'])
      .where('l.ativo = :ativo', { ativo: true })
      .andWhere("l.tipo = 'despesa'")
      .andWhere('l.destino_id IS NOT NULL');

    if (de) qb.andWhere('l.data_evento >= :de', { de });
    if (ate) qb.andWhere('l.data_evento <= :ate', { ate });

    qb.groupBy('d.nome').orderBy('SUM(l.valor)', 'DESC');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      nome: r.nome,
      valor: parseFloat(r.valor),
    }));
  }

  async porTipoPagamento(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.leftJoin('l.tipo_pagamento', 'tp')
      .select([
        'tp.nome as nome',
        'SUM(l.valor) as valor',
        'COUNT(*) as quantidade',
      ])
      .groupBy('tp.nome')
      .orderBy('SUM(l.valor)', 'DESC');

    const results = await qb.getRawMany();
    return results.map((r) => ({
      nome: r.nome,
      valor: parseFloat(r.valor),
      quantidade: parseInt(r.quantidade),
    }));
  }

  async saldoDiario(de?: string, ate?: string) {
    const qb = this.baseQuery(de, ate);
    qb.select([
      "TO_CHAR(l.data_evento, 'YYYY-MM-DD') as data",
      "COALESCE(SUM(CASE WHEN l.tipo = 'receita' THEN l.valor ELSE -l.valor END), 0) as saldo",
    ])
      .groupBy("TO_CHAR(l.data_evento, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(l.data_evento, 'YYYY-MM-DD')", 'ASC');

    const results = await qb.getRawMany();
    let acumulado = 0;
    return results.map((r) => {
      acumulado += parseFloat(r.saldo);
      return {
        data: r.data,
        saldo: acumulado,
      };
    });
  }
}
