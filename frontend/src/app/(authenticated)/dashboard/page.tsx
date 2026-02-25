'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { dashboardApi, lojasApi } from '@/services/api';
import {
  DashboardResumo,
  ReceitaDespesaMensal,
  DadosPorCategoria,
  SaldoDiario,
  ProjecaoMensal,
  Loja,
} from '@/types';
import { formatCurrency, formatMesAno } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import DateInput from '@/components/ui/DateInput';
import LancamentoModal from '@/components/lancamentos/LancamentoModal';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  PlusIcon,
  CalendarDaysIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const currencyFormatter = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [receitaDespesa, setReceitaDespesa] = useState<ReceitaDespesaMensal[]>([]);
  const [porEtiqueta, setPorEtiqueta] = useState<DadosPorCategoria[]>([]);
  const [porOrigem, setPorOrigem] = useState<DadosPorCategoria[]>([]);
  const [porDestino, setPorDestino] = useState<DadosPorCategoria[]>([]);
  const [saldo, setSaldo] = useState<SaldoDiario[]>([]);
  const [projecao, setProjecao] = useState<ProjecaoMensal[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState('');
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

  // Carrega lojas uma vez
  useEffect(() => {
    lojasApi.list().then((res) => {
      const ativas = (res.data as Loja[]).filter((l: Loja) => l.ativo);
      setLojas(ativas);
      const matriz = ativas.find((l: Loja) => l.matriz);
      if (matriz) setLojaId(matriz.id);
      else if (ativas.length > 0) setLojaId(ativas[0].id);
    });
  }, []);

  const load = async () => {
    if (!lojaId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (de) params.de = de;
      if (ate) params.ate = ate;
      if (lojaId) params.loja_id = lojaId;

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
      setReceitaDespesa(rd.data);
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
  }, [de, ate, lojaId]);

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

  // ─── Chart configs ───

  const baseChartConfig: ApexCharts.ApexOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
    tooltip: {
      y: { formatter: (val: number) => formatCurrency(val) },
      theme: 'light',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
  };

  // Receitas vs Despesas
  const recDespOptions: ApexCharts.ApexOptions = {
    ...baseChartConfig,
    chart: { ...baseChartConfig.chart, type: 'bar' },
    colors: ['#10b981', '#f43f5e'],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '55%', borderRadiusApplication: 'end' },
    },
    xaxis: {
      categories: receitaDespesa.map((d) => formatMesAno(d.mes)),
      labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (val: number) => currencyFormatter(val),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { size: 6, shape: 'circle' as const },
      fontSize: '12px',
      labels: { colors: '#64748b' },
    },
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'vertical', opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] },
    },
  };
  const recDespSeries = [
    { name: 'Receitas', data: receitaDespesa.map((d) => d.receitas) },
    { name: 'Despesas', data: receitaDespesa.map((d) => d.despesas) },
  ];

  // Saldo Acumulado
  const saldoOptions: ApexCharts.ApexOptions = {
    ...baseChartConfig,
    chart: { ...baseChartConfig.chart, type: 'area' },
    colors: ['#6366f1'],
    xaxis: {
      categories: saldo.map((s) => {
        const d = s.data.split('-');
        return `${d[2]}/${d[1]}`;
      }),
      labels: { style: { colors: '#94a3b8', fontSize: '11px' }, rotate: -45, rotateAlways: saldo.length > 10 },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: Math.min(saldo.length, 12),
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (val: number) => currencyFormatter(val),
      },
    },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] },
    },
    stroke: { width: 2.5, curve: 'smooth' },
    legend: { show: false },
  };
  const saldoSeries = [{ name: 'Saldo', data: saldo.map((s) => s.saldo) }];

  // Por Etiqueta (donut)
  const etiquetaLabels = porEtiqueta.map((e) => `${e.nome} (${e.tipo})`);
  const etiquetaValues = porEtiqueta.map((e) => e.valor);
  const donutColors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
  const etiquetaOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', animations: { enabled: true, speed: 600 } },
    colors: donutColors.slice(0, porEtiqueta.length),
    labels: etiquetaLabels,
    legend: {
      position: 'bottom',
      fontSize: '11px',
      markers: { size: 6, shape: 'circle' as const },
      labels: { colors: '#64748b' },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => formatCurrency(etiquetaValues.reduce((a, b) => a + b, 0)),
            },
            value: { formatter: (val: string) => formatCurrency(parseFloat(val)) },
          },
        },
      },
    },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
  };

  // Por Origem (horizontal bar)
  const origemOptions: ApexCharts.ApexOptions = {
    ...baseChartConfig,
    chart: { ...baseChartConfig.chart, type: 'bar' },
    colors: ['#10b981'],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 5, barHeight: '60%', borderRadiusApplication: 'end' },
    },
    xaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (val: string) => currencyFormatter(parseFloat(val)),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
    },
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'horizontal', opacityFrom: 0.85, opacityTo: 1, stops: [0, 100] },
    },
    legend: { show: false },
  };
  const origemSeries = [{ name: 'Valor', data: porOrigem.map((o) => o.valor) }];
  const origemCategories = porOrigem.map((o) => o.nome);

  // Por Destino (horizontal bar)
  const destinoOptions: ApexCharts.ApexOptions = {
    ...baseChartConfig,
    chart: { ...baseChartConfig.chart, type: 'bar' },
    colors: ['#f43f5e'],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 5, barHeight: '60%', borderRadiusApplication: 'end' },
    },
    xaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (val: string) => currencyFormatter(parseFloat(val)),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
    },
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'horizontal', opacityFrom: 0.85, opacityTo: 1, stops: [0, 100] },
    },
    legend: { show: false },
  };
  const destinoSeries = [{ name: 'Valor', data: porDestino.map((d) => d.valor) }];
  const destinoCategories = porDestino.map((d) => d.nome);

  // Projeção
  const projecaoOptions: ApexCharts.ApexOptions = {
    ...baseChartConfig,
    chart: { ...baseChartConfig.chart, type: 'bar', stacked: false },
    colors: ['#10b981', '#14b8a6', '#f43f5e', '#fb7185'],
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '60%', borderRadiusApplication: 'end' },
    },
    xaxis: {
      categories: projecao.map((p) => formatMesAno(p.mes)),
      labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px' },
        formatter: (val: number) => currencyFormatter(val),
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      markers: { size: 6, shape: 'circle' as const },
      fontSize: '11px',
      labels: { colors: '#64748b' },
    },
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'vertical', opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] },
    },
  };
  const projecaoSeries = [
    { name: 'Rec. Bruto', data: projecao.map((p) => p.receitas_bruto) },
    { name: 'Rec. Líquido', data: projecao.map((p) => p.receitas_liquido) },
    { name: 'Desp. Bruto', data: projecao.map((p) => p.despesas_bruto) },
    { name: 'Desp. Líquido', data: projecao.map((p) => p.despesas_liquido) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HomeIcon className="h-7 w-7 text-primary-600" />
            Fluxo de Caixa
          </h1>
          <p className="text-sm text-gray-500">Visão geral do fluxo de caixa</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary hidden sm:flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo Lançamento
        </button>
      </div>

      {/* Filtros de período + loja + botão mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="sm:flex-none">
          <select className="input-field text-sm" value={lojaId} onChange={(e) => setLojaId(e.target.value)}>
            {lojas.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}{l.matriz ? ' (Matriz)' : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <div className="flex-1 sm:flex-none sm:w-40">
            <DateInput value={de} onChange={setDe} />
          </div>
          <span className="text-gray-400 text-xs">até</span>
          <div className="flex-1 sm:flex-none sm:w-40">
            <DateInput value={ate} onChange={setAte} />
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary sm:hidden flex items-center justify-center gap-1 w-full">
          <PlusIcon className="h-5 w-5" />
          Novo Lançamento
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

      {/* Receitas vs Despesas + Saldo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Receitas vs Despesas</h3>
          <p className="text-xs text-gray-400 mb-2">Comparativo mensal</p>
          {receitaDespesa.length > 0 ? (
            <Chart options={recDespOptions} series={recDespSeries} type="bar" height={280} />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-gray-300">Sem dados no período</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Saldo Acumulado</h3>
          <p className="text-xs text-gray-400 mb-2">Evolução ao longo do tempo</p>
          {saldo.length > 0 ? (
            <Chart options={saldoOptions} series={saldoSeries} type="area" height={280} />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-gray-300">Sem dados no período</div>
          )}
        </div>
      </div>

      {/* Distribuições */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Por Etiqueta</h3>
          <p className="text-xs text-gray-400 mb-2">Distribuição por categoria</p>
          {porEtiqueta.length > 0 ? (
            <Chart options={etiquetaOptions} series={etiquetaValues} type="donut" height={260} />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-gray-300">Sem dados</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Receitas por Origem</h3>
          <p className="text-xs text-gray-400 mb-2">De onde vêm as receitas</p>
          {porOrigem.length > 0 ? (
            <Chart
              options={{ ...origemOptions, xaxis: { ...origemOptions.xaxis, categories: origemCategories } }}
              series={origemSeries}
              type="bar"
              height={260}
            />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-gray-300">Sem dados</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Despesas por Destino</h3>
          <p className="text-xs text-gray-400 mb-2">Para onde vão as despesas</p>
          {porDestino.length > 0 ? (
            <Chart
              options={{ ...destinoOptions, xaxis: { ...destinoOptions.xaxis, categories: destinoCategories } }}
              series={destinoSeries}
              type="bar"
              height={260}
            />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-gray-300">Sem dados</div>
          )}
        </div>
      </div>

      {/* Projeção de Parcelas (no final) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-xl bg-violet-50">
            <CalendarDaysIcon className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Projeção de Parcelas</h2>
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
            <Chart options={projecaoOptions} series={projecaoSeries} type="bar" height={280} />
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Nenhuma parcela futura</p>
            <p className="text-xs mt-1">Lançamentos com pagamento &quot;a prazo&quot; aparecerão aqui</p>
          </div>
        )}
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
