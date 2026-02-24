'use client';

import { useState, useEffect } from 'react';
import { dashboardApi } from '@/services/api';
import {
  DashboardResumo,
  ReceitaDespesaMensal,
  DadosPorCategoria,
  SaldoDiario,
  ProjecaoMensal,
} from '@/types';
import { formatCurrency, formatMesAno } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import DateInput from '@/components/ui/DateInput';
import LancamentoModal from '@/components/lancamentos/LancamentoModal';
import {
  AreaChart,
  BarChart,
  DonutChart,
  Card,
  Title,
  Text,
} from '@tremor/react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  PlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [receitaDespesa, setReceitaDespesa] = useState<ReceitaDespesaMensal[]>([]);
  const [porEtiqueta, setPorEtiqueta] = useState<DadosPorCategoria[]>([]);
  const [porOrigem, setPorOrigem] = useState<DadosPorCategoria[]>([]);
  const [porDestino, setPorDestino] = useState<DadosPorCategoria[]>([]);
  const [saldo, setSaldo] = useState<SaldoDiario[]>([]);
  const [projecao, setProjecao] = useState<ProjecaoMensal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
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

      const [r, rd, pe, po, pd, s, proj] = await Promise.all([
        dashboardApi.resumo(params),
        dashboardApi.receitaDespesa(params),
        dashboardApi.porEtiqueta(params),
        dashboardApi.porOrigem(params),
        dashboardApi.porDestino(params),
        dashboardApi.saldo(params),
        dashboardApi.projecao({ meses: '6' }),
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
      setProjecao(proj.data);
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

  // Projeção totais
  const projecaoTotalReceitasBruto = projecao.reduce((s, p) => s + p.receitas_bruto, 0);
  const projecaoTotalReceitasLiquido = projecao.reduce((s, p) => s + p.receitas_liquido, 0);
  const projecaoTotalDespesasBruto = projecao.reduce((s, p) => s + p.despesas_bruto, 0);
  const projecaoTotalDespesasLiquido = projecao.reduce((s, p) => s + p.despesas_liquido, 0);

  const projecaoChartData = projecao.map((p) => ({
    mes: formatMesAno(p.mes),
    'Receitas Bruto': p.receitas_bruto,
    'Receitas Líquido': p.receitas_liquido,
    'Despesas Bruto': p.despesas_bruto,
    'Despesas Líquido': p.despesas_liquido,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-sm text-gray-500">Visão geral do fluxo de caixa</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Novo Lançamento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
      <div className="flex items-end gap-2 sm:gap-3 mb-6">
        <div className="flex-1 sm:flex-none sm:w-40">
          <label className="text-xs text-gray-500 block">De</label>
          <DateInput value={de} onChange={setDe} />
        </div>
        <div className="flex-1 sm:flex-none sm:w-40">
          <label className="text-xs text-gray-500 block">Até</label>
          <DateInput value={ate} onChange={setAte} />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`p-1.5 sm:p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-lg sm:text-2xl font-bold mt-1 sm:mt-2 ${card.color}`}>
              {(card as any).isCurrency === false
                ? card.value
                : formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Card de Projeção */}
      {projecao.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDaysIcon className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-semibold text-gray-900">Projeção de Parcelas</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Receitas Bruto</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(projecaoTotalReceitasBruto)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Receitas Líquido</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(projecaoTotalReceitasLiquido)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Despesas Bruto</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(projecaoTotalDespesasBruto)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Despesas Líquido</p>
              <p className="text-sm font-bold text-red-700">{formatCurrency(projecaoTotalDespesasLiquido)}</p>
            </div>
          </div>
          <BarChart
            className="h-60"
            data={projecaoChartData}
            index="mes"
            categories={['Receitas Bruto', 'Receitas Líquido', 'Despesas Bruto', 'Despesas Líquido']}
            colors={['emerald', 'green', 'red', 'rose']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={48}
          />
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
            yAxisWidth={48}
          />
        </Card>

        <Card>
          <Title>Saldo Acumulado</Title>
          <Text>Evolução do saldo ao longo do tempo</Text>
          <AreaChart
            className="mt-4 h-60 sm:h-72"
            data={saldo}
            index="data"
            categories={['saldo']}
            colors={['blue']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={48}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            yAxisWidth={48}
            layout="vertical"
          />
        </Card>

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
            yAxisWidth={48}
            layout="vertical"
          />
        </Card>
      </div>

      <LancamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={null}
        onSaved={load}
      />
    </div>
  );
}
