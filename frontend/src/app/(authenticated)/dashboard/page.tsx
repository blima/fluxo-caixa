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
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Total Despesas',
      value: resumo?.total_despesas ?? 0,
      icon: ArrowTrendingDownIcon,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'Saldo',
      value: resumo?.saldo ?? 0,
      icon: ScaleIcon,
      color: (resumo?.saldo ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: (resumo?.saldo ?? 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      border: (resumo?.saldo ?? 0) >= 0 ? 'border-emerald-100' : 'border-rose-100',
    },
    {
      title: 'Lançamentos',
      value: resumo?.total_lancamentos ?? 0,
      icon: BanknotesIcon,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-sm text-gray-500">Visão geral do fluxo de caixa</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary hidden sm:flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo Lançamento
        </button>
      </div>

      {/* Filtros de período */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 sm:flex-none sm:w-40">
          <DateInput value={de} onChange={setDe} />
        </div>
        <span className="text-gray-300 text-sm">—</span>
        <div className="flex-1 sm:flex-none sm:w-40">
          <DateInput value={ate} onChange={setAte} />
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary sm:hidden flex items-center gap-1 whitespace-nowrap">
          <PlusIcon className="h-5 w-5" />
          Novo
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`bg-white rounded-2xl shadow-sm border ${card.border} p-3 sm:p-5 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-gray-500">{card.title}</p>
              <div className={`p-1.5 sm:p-2 rounded-xl ${card.bg}`}>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-xl bg-violet-50">
            <CalendarDaysIcon className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Projeção de Parcelas</h2>
            <p className="text-xs text-gray-400">Lançamentos a prazo</p>
          </div>
        </div>
        {projecao.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-emerald-50/60 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Rec. Bruto</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">{formatCurrency(projecaoTotalReceitasBruto)}</p>
              </div>
              <div className="bg-emerald-50/60 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Rec. Líquido</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatCurrency(projecaoTotalReceitasLiquido)}</p>
              </div>
              <div className="bg-rose-50/60 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Desp. Bruto</p>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{formatCurrency(projecaoTotalDespesasBruto)}</p>
              </div>
              <div className="bg-rose-50/60 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Desp. Líquido</p>
                <p className="text-sm font-bold text-rose-700 mt-0.5">{formatCurrency(projecaoTotalDespesasLiquido)}</p>
              </div>
            </div>
            <BarChart
              className="h-64"
              data={projecaoChartData}
              index="mes"
              categories={['Receitas Bruto', 'Receitas Líquido', 'Despesas Bruto', 'Despesas Líquido']}
              colors={['emerald', 'teal', 'rose', 'pink']}
              valueFormatter={(v) => formatCurrency(v)}
              yAxisWidth={48}
              showAnimation
              showLegend
            />
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Nenhuma parcela futura</p>
            <p className="text-xs mt-1">Lançamentos com pagamento &quot;a prazo&quot; aparecerão aqui</p>
          </div>
        )}
      </div>

      {/* Receitas vs Despesas + Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <h3 className="text-sm font-semibold text-gray-900 ml-1">Receitas vs Despesas</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Comparativo mensal</p>
          <BarChart
            className="h-72"
            data={receitaDespesa}
            index="mes"
            categories={['receitas', 'despesas']}
            colors={['emerald', 'rose']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={48}
            showAnimation
            showLegend={false}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900 ml-1">Saldo Acumulado</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Evolução ao longo do tempo</p>
          <AreaChart
            className="h-72"
            data={saldo}
            index="data"
            categories={['saldo']}
            colors={['blue']}
            valueFormatter={(v) => formatCurrency(v)}
            yAxisWidth={48}
            showAnimation
            showLegend={false}
            curveType="monotone"
          />
        </div>
      </div>

      {/* Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Por Etiqueta</h3>
          <p className="text-xs text-gray-400 mb-4">Distribuição por categoria</p>
          {porEtiqueta.length > 0 ? (
            <DonutChart
              className="h-56"
              data={porEtiqueta.map((e) => ({ name: `${e.nome} (${e.tipo})`, value: e.valor }))}
              category="value"
              index="name"
              valueFormatter={(v) => formatCurrency(v)}
              colors={['blue', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'pink', 'indigo']}
              showAnimation
              variant="pie"
            />
          ) : (
            <div className="flex items-center justify-center h-56 text-sm text-gray-300">Sem dados</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900 ml-1">Receitas por Origem</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">De onde vêm as receitas</p>
          {porOrigem.length > 0 ? (
            <BarChart
              className="h-56"
              data={porOrigem}
              index="nome"
              categories={['valor']}
              colors={['emerald']}
              valueFormatter={(v) => formatCurrency(v)}
              yAxisWidth={48}
              layout="vertical"
              showAnimation
              showLegend={false}
            />
          ) : (
            <div className="flex items-center justify-center h-56 text-sm text-gray-300">Sem dados</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <h3 className="text-sm font-semibold text-gray-900 ml-1">Despesas por Destino</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Para onde vão as despesas</p>
          {porDestino.length > 0 ? (
            <BarChart
              className="h-56"
              data={porDestino}
              index="nome"
              categories={['valor']}
              colors={['rose']}
              valueFormatter={(v) => formatCurrency(v)}
              yAxisWidth={48}
              layout="vertical"
              showAnimation
              showLegend={false}
            />
          ) : (
            <div className="flex items-center justify-center h-56 text-sm text-gray-300">Sem dados</div>
          )}
        </div>
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
