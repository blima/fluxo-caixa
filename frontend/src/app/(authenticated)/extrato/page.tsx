'use client';

import { useState, useEffect, useMemo } from 'react';
import { extratoApi } from '@/services/api';
import { useLoja } from '@/contexts/LojaContext';
import { ExtratoItem, ExtratoTotais } from '@/types';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import DateInput from '@/components/ui/DateInput';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface GrupoDia {
  data: string;
  items: ExtratoItem[];
  saldo: number;
  movDia: number;
}

export default function ExtratoPage() {
  const [itens, setItens] = useState<ExtratoItem[]>([]);
  const [totais, setTotais] = useState<ExtratoTotais | null>(null);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [infoId, setInfoId] = useState<string | null>(null);
  const { lojaId } = useLoja();
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
    if (!lojaId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (de) params.de = de;
      if (ate) params.ate = ate;
      if (lojaId) params.loja_id = lojaId;
      const res = await extratoApi.list(params);
      setSaldoInicial(res.data.saldo_inicial);
      setItens(res.data.itens);
      setTotais(res.data.totais);
    } catch {
      toast.error('Erro ao carregar extrato');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [de, ate, lojaId]);

  const gruposComSaldo = useMemo<GrupoDia[]>(() => {
    const map = new Map<string, ExtratoItem[]>();
    itens.forEach(item => {
      const data = item.data_evento.split('T')[0];
      if (!map.has(data)) map.set(data, []);
      map.get(data)!.push(item);
    });
    let acumulado = saldoInicial;
    return Array.from(map.entries()).map(([data, items]) => {
      const mov = items.reduce((acc, i) =>
        acc + (i.tipo === 'receita' ? i.valor_liquido : -i.valor_liquido), 0);
      acumulado += mov;
      return { data, items, saldo: Math.round(acumulado * 100) / 100, movDia: Math.round(mov * 100) / 100 };
    });
  }, [itens, saldoInicial]);

  const saldoFinal = gruposComSaldo.length > 0
    ? gruposComSaldo[gruposComSaldo.length - 1].saldo
    : saldoInicial;

  const saldoBruto = (totais?.receitas_bruto ?? 0) - (totais?.despesas_bruto ?? 0);
  const saldoLiquido = (totais?.receitas_liquido ?? 0) - (totais?.despesas_liquido ?? 0);

  const formatDataDia = (dataStr: string) => {
    const [year, month, day] = dataStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return `${day}/${month}/${year} - ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-7 w-7 text-primary-600" />
            Extrato
          </h1>
          <p className="text-sm text-gray-500">Extrato detalhado com saldo acumulado por dia</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex-1 min-w-0 sm:flex-none sm:w-40">
            <DateInput value={de} onChange={setDe} />
          </div>
          <span className="text-gray-400 text-xs flex-shrink-0">até</span>
          <div className="flex-1 min-w-0 sm:flex-none sm:w-40">
            <DateInput value={ate} onChange={setAte} />
          </div>
        </div>
      </div>

      {/* Cards de totais */}
      {totais && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Total Receitas</p>
              <div className="p-1.5 rounded-lg bg-green-50">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totais.receitas_bruto)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Taxa: <span className="text-orange-500">{formatCurrency(totais.receitas_taxa)}</span>
              {' | '}Líquido: <span className="text-green-600 font-semibold">{formatCurrency(totais.receitas_liquido)}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Total Despesas</p>
              <div className="p-1.5 rounded-lg bg-red-50">
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totais.despesas_bruto)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Taxa: <span className="text-orange-500">{formatCurrency(totais.despesas_taxa)}</span>
              {' | '}Líquido: <span className="text-red-600 font-semibold">{formatCurrency(totais.despesas_liquido)}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Saldo</p>
              <div className={`p-1.5 rounded-lg ${saldoLiquido >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <ScaleIcon className={`h-5 w-5 ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-lg font-bold ${saldoBruto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoBruto)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Líquido: <span className={`font-semibold ${saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoLiquido)}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Loading />
        ) : itens.length === 0 ? (
          <>
            {/* Saldo Inicial */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Saldo Inicial</span>
              </div>
              <span className={`text-sm font-bold ${saldoInicial >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoInicial)}
              </span>
            </div>
            <EmptyState message="Nenhum lançamento no período" />
            {/* Saldo Final */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-blue-50 border-t border-blue-100">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Saldo Final</span>
              </div>
              <span className={`text-sm font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoFinal)}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Saldo Inicial */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Saldo Inicial</span>
              </div>
              <span className={`text-sm font-bold ${saldoInicial >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoInicial)}
              </span>
            </div>

            {/* Mobile card layout */}
            <div className="sm:hidden">
              {gruposComSaldo.map((grupo) => (
                <div key={grupo.data}>
                  {/* Header do dia */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">{formatDataDia(grupo.data)}</span>
                    </div>
                  </div>

                  {/* Lançamentos do dia */}
                  <div className="divide-y divide-gray-100">
                    {grupo.items.map((item) => (
                      <div key={item.id} className={`${item.tipo === 'receita' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                        <div className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`flex-shrink-0 p-1 rounded-lg ${item.tipo === 'receita' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                {item.tipo === 'receita'
                                  ? <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-emerald-600" />
                                  : <ArrowTrendingDownIcon className="h-3.5 w-3.5 text-rose-600" />
                                }
                              </div>
                              <span className="text-sm font-medium text-gray-900 truncate">{item.descricao}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <span className={`text-sm font-semibold whitespace-nowrap ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(item.valor_liquido)}
                              </span>
                              <button onClick={() => setInfoId(infoId === item.id ? null : item.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                <InformationCircleIcon className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                            <span className="text-gray-400">Bruto: {formatCurrency(item.valor_bruto)}</span>
                            {item.taxa > 0 && <span className="text-orange-500">Taxa: {item.taxa}%</span>}
                            {item.etiqueta && <Badge color={item.etiqueta.cor}>{item.etiqueta.nome}</Badge>}
                          </div>
                        </div>
                        {infoId === item.id && (
                          <div className="px-4 pb-3 text-xs text-gray-500 bg-blue-50 border-t border-blue-100">
                            <span>Lançado por <strong className="text-gray-700">{item.usuario?.nome || '-'}</strong> em {formatDateTime(item.created_at)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Saldo do dia */}
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Mov. dia: <span className={`font-semibold ${grupo.movDia >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(grupo.movDia)}</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      Saldo: <span className={`${grupo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(grupo.saldo)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Bruto</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taxa%</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Taxa</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Líquido</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {gruposComSaldo.map((grupo) => (
                    <>
                      {/* Header do dia */}
                      <tr key={`header-${grupo.data}`} className="bg-gray-100">
                        <td colSpan={7} className="px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">{formatDataDia(grupo.data)}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Lançamentos do dia */}
                      {grupo.items.map((item) => (
                        <tr key={item.id} className={`border-b border-gray-100 ${item.tipo === 'receita' ? 'bg-green-50/40 hover:bg-green-50' : 'bg-red-50/40 hover:bg-red-50'}`}>
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className={`p-1.5 rounded-lg ${item.tipo === 'receita' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                {item.tipo === 'receita'
                                  ? <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                                  : <ArrowTrendingDownIcon className="h-4 w-4 text-rose-600" />
                                }
                              </div>
                              <span className={`text-[10px] ${item.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.descricao}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-700">{formatCurrency(item.valor_bruto)}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">
                            {item.taxa > 0 ? `${item.taxa}%` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-orange-500">
                            {item.valor_taxa > 0 ? formatCurrency(item.valor_taxa) : '-'}
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(item.valor_liquido)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="relative inline-block">
                              <button onClick={() => setInfoId(infoId === item.id ? null : item.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                <InformationCircleIcon className="h-5 w-5" />
                              </button>
                              {infoId === item.id && (
                                <div className="absolute right-0 bottom-full mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 text-left">
                                  <div>Lançado por <strong>{item.usuario?.nome || '-'}</strong></div>
                                  <div>em {formatDateTime(item.created_at)}</div>
                                  <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Saldo do dia */}
                      <tr key={`saldo-${grupo.data}`} className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={7} className="px-6 py-2">
                          <div className="flex items-center justify-end gap-6 text-xs">
                            <span className="text-gray-500">
                              Mov. dia: <span className={`font-semibold ${grupo.movDia >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(grupo.movDia)}</span>
                            </span>
                            <span className="font-semibold text-gray-600">
                              Saldo: <span className={`${grupo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(grupo.saldo)}</span>
                            </span>
                          </div>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Saldo Final */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-blue-50 border-t border-blue-100">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Saldo Final</span>
              </div>
              <span className={`text-sm font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoFinal)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
