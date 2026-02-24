'use client';

import { useState, useEffect } from 'react';
import { extratoApi } from '@/services/api';
import { ExtratoItem, ExtratoTotais } from '@/types';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

export default function ExtratoPage() {
  const [itens, setItens] = useState<ExtratoItem[]>([]);
  const [totais, setTotais] = useState<ExtratoTotais | null>(null);
  const [loading, setLoading] = useState(true);
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
      const res = await extratoApi.list(params);
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
  }, [de, ate]);

  const saldoBruto = (totais?.receitas_bruto ?? 0) - (totais?.despesas_bruto ?? 0);
  const saldoLiquido = (totais?.receitas_liquido ?? 0) - (totais?.despesas_liquido ?? 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-7 w-7 text-primary-600" />
            Extrato
          </h1>
          <p className="text-sm text-gray-500">Visão detalhada com valores bruto e líquido</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:flex-none">
            <label className="text-xs text-gray-500 block">De</label>
            <input type="date" className="input-field text-sm" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="text-xs text-gray-500 block">Até</label>
            <input type="date" className="input-field text-sm" value={ate} onChange={(e) => setAte(e.target.value)} />
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : itens.length === 0 ? (
          <EmptyState message="Nenhum lançamento no período" />
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden divide-y divide-gray-100">
              {itens.map((item) => (
                <div key={item.id} className={`px-4 py-3 ${item.tipo === 'receita' ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${item.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-gray-900 truncate">{item.descricao}</span>
                    </div>
                    <span className={`text-sm font-semibold ml-2 whitespace-nowrap ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.valor_liquido)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                    <span className="text-gray-500">{formatDate(item.data_evento)}</span>
                    <span className="text-gray-400">Bruto: {formatCurrency(item.valor_bruto)}</span>
                    {item.taxa > 0 && <span className="text-orange-500">Taxa: {item.taxa}%</span>}
                    {item.etiqueta && <Badge color={item.etiqueta.cor}>{item.etiqueta.nome}</Badge>}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="overflow-x-auto">
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Bruto</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taxa%</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Taxa</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id} className={`border-b border-gray-100 ${item.tipo === 'receita' ? 'bg-green-50/40 hover:bg-green-50' : 'bg-red-50/40 hover:bg-red-50'}`}>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.data_evento)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.tipo === 'receita' ? 'success' : 'danger'}>
                          {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
