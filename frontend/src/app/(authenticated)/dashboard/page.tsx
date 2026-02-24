'use client';

import { useState, useEffect } from 'react';
import { dashboardApi } from '@/services/api';
import {
  DashboardResumo,
  ReceitaDespesaMensal,
  DadosPorCategoria,
  SaldoDiario,
} from '@/types';
import { formatCurrency, formatMesAno } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import {
  AreaChart,
  BarChart,
  DonutChart,
  Card,
  Title,
  Text,
  Flex,
  Metric,
  BadgeDelta,
} from '@tremor/react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [receitaDespesa, setReceitaDespesa] = useState<ReceitaDespesaMensal[]>([]);
  const [porEtiqueta, setPorEtiqueta] = useState<DadosPorCategoria[]>([]);
  const [porOrigem, setPorOrigem] = useState<DadosPorCategoria[]>([]);
  const [porDestino, setPorDestino] = useState<DadosPorCategoria[]>([]);
  const [saldo, setSaldo] = useState<SaldoDiario[]>([]);
  const [de, setDe] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [ate, setAte] = useState(() => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
  });

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (de) params.de = de;
      if (ate) params.ate = ate;

      const [r, rd, pe, po, pd, s] = await Promise.all([
        dashboardApi.resumo(params),
        dashboardApi.receitaDespesa(params),
        dashboardApi.porEtiqueta(params),
        dashboardApi.porOrigem(params),
        dashboardApi.porDestino(params),
        dashboardApi.saldo(params),
      ]);

      setResumo(r.data);
      setReceitaDespesa(
        rd.data.map((d: ReceitaDespesaMensal) => ({
          ...d,
          mes: formatMesAno(d.mes),
        })),
      );
      setPorEtiqueta(pe.data);
      setPorOrigem(po.data);
      setPorDestino(pd.data);
      setSaldo(s.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [de, ate]);

  if (loading) return <Loading />;

  const cards = [
    {
      title: 'Total Receitas',
      value: resumo?.total_receitas ?? 0,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Despesas',
      value: resumo?.total_despesas ?? 0,
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Saldo',
      value: resumo?.saldo ?? 0,
      icon: ScaleIcon,
      color: (resumo?.saldo ?? 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bg: (resumo?.saldo ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Lançamentos',
      value: resumo?.total_lancamentos ?? 0,
      icon: BanknotesIcon,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      isCurrency: false,
    },
  ];

  const etiquetaReceitas = porEtiqueta.filter((e) => e.tipo === 'receita');
  const etiquetaDespesas = porEtiqueta.filter((e) => e.tipo === 'despesa');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Visão geral do fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-gray-500 block">De</label>
            <input
              type="date"
              className="input-field text-sm"
              value={de}
              onChange={(e) => setDe(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">Até</label>
            <input
              type="date"
              className="input-field text-sm"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>
              {(card as any).isCurrency === false
                ? card.value
                : formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Receitas vs Despesas por Mês */}
        <Card>
          <Title>Receitas vs Despesas</Title>
          <Text>Comparativo mensal</Text>
          <BarChart
            className="mt-4 h-72"
            data={receitaDespesa}
            index="mes"
            categories={['receitas', 'despesas']}
            colors={['emerald', 'red']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={80}
          />
        </Card>

        {/* Saldo Acumulado */}
        <Card>
          <Title>Saldo Acumulado</Title>
          <Text>Evolução do saldo ao longo do tempo</Text>
          <AreaChart
            className="mt-4 h-72"
            data={saldo}
            index="data"
            categories={['saldo']}
            colors={['blue']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={80}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Por Etiqueta */}
        <Card>
          <Title>Por Etiqueta</Title>
          <Text>Distribuição por categoria</Text>
          <DonutChart
            className="mt-4 h-52"
            data={porEtiqueta.map((e) => ({ name: `${e.nome} (${e.tipo})`, value: e.valor }))}
            category="value"
            index="name"
            valueFormatter={(v) => formatCurrency(v)}
            colors={['blue', 'emerald', 'amber', 'red', 'violet', 'pink']}
          />
        </Card>

        {/* Receitas por Origem */}
        <Card>
          <Title>Receitas por Origem</Title>
          <Text>De onde vêm as receitas</Text>
          <BarChart
            className="mt-4 h-52"
            data={porOrigem}
            index="nome"
            categories={['valor']}
            colors={['emerald']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={80}
            layout="vertical"
          />
        </Card>

        {/* Despesas por Destino */}
        <Card>
          <Title>Despesas por Destino</Title>
          <Text>Para onde vão as despesas</Text>
          <BarChart
            className="mt-4 h-52"
            data={porDestino}
            index="nome"
            categories={['valor']}
            colors={['red']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={80}
            layout="vertical"
          />
        </Card>
      </div>
    </div>
  );
}
