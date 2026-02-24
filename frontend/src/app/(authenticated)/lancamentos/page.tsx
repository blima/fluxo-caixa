'use client';

import { useState, useEffect } from 'react';
import { lancamentosApi } from '@/services/api';
import { Lancamento } from '@/types';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import DateInput from '@/components/ui/DateInput';
import LancamentoModal from '@/components/lancamentos/LancamentoModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export default function LancamentosPage() {
  const [items, setItems] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'' | 'receita' | 'despesa'>('');
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
      if (filtroTipo) params.tipo = filtroTipo;
      if (de) params.de = de;
      if (ate) params.ate = ate;
      const res = await lancamentosApi.list(params);
      setItems(res.data);
    } catch {
      toast.error('Erro ao carregar lançamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filtroTipo, de, ate]);

  const handleRemove = async (id: string) => {
    if (!confirm('Excluir este lançamento?')) return;
    try {
      await lancamentosApi.remove(id);
      toast.success('Lançamento excluído!');
      load();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Lancamento) => {
    setEditing(item);
    setModalOpen(true);
  };

  const totalReceitas = items.filter(i => i.tipo === 'receita').reduce((s, i) => s + parseFloat(String(i.valor)), 0);
  const totalDespesas = items.filter(i => i.tipo === 'despesa').reduce((s, i) => s + parseFloat(String(i.valor)), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="h-7 w-7 text-primary-600" />
            Lançamentos
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span>Receitas: <span className="font-semibold text-green-600">{formatCurrency(totalReceitas)}</span></span>
            <span>Despesas: <span className="font-semibold text-red-600">{formatCurrency(totalDespesas)}</span></span>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span>Novo<span className="hidden sm:inline"> Lançamento</span></span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block">Tipo</label>
          <select className="input-field text-sm" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as any)}>
            <option value="">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">De</label>
          <DateInput value={de} onChange={setDe} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block">Até</label>
          <DateInput value={ate} onChange={setAte} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum lançamento encontrado" action={
            <button onClick={openCreate} className="btn-primary text-sm">Criar primeiro lançamento</button>
          } />
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${item.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-gray-900 truncate">{item.descricao}</span>
                      </div>
                      <span className={`text-sm font-semibold ml-2 whitespace-nowrap ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(String(item.valor)))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">{formatDate(item.data_evento)}</span>
                      <span className="text-xs text-gray-400">
                        {item.tipo === 'receita' ? item.origem?.nome : item.destino?.nome || '-'}
                      </span>
                      {item.etiqueta && <Badge color={item.etiqueta.cor}>{item.etiqueta.nome}</Badge>}
                      {parseFloat(String(item.taxa)) > 0 && (
                        <span className="text-xs text-orange-500">{item.taxa}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <TrashIcon className="h-5 w-5" />
                    </button>
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
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Origem/Destino</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Etiqueta</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taxa%</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.data_evento)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.tipo === 'receita' ? 'success' : 'danger'}>
                          {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.descricao}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.tipo === 'receita' ? item.origem?.nome : item.destino?.nome || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {item.etiqueta && <Badge color={item.etiqueta.cor}>{item.etiqueta.nome}</Badge>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.tipo_pagamento?.nome || '-'}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {parseFloat(String(item.taxa)) > 0 ? `${item.taxa}%` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold text-right ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(String(item.valor)))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleRemove(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <LancamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
}
