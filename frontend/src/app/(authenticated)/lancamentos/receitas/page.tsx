'use client';

import { useState, useEffect } from 'react';
import { lancamentosApi, origensApi, etiquetasApi, tiposPagamentoApi } from '@/services/api';
import { Lancamento, Origem, Etiqueta, TipoPagamento } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function ReceitasPage() {
  const [items, setItems] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);

  const [origens, setOrigens] = useState<Origem[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [tiposPagamento, setTiposPagamento] = useState<TipoPagamento[]>([]);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [origemId, setOrigemId] = useState('');
  const [etiquetaId, setEtiquetaId] = useState('');
  const [tipoPagamentoId, setTipoPagamentoId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await lancamentosApi.list({ tipo: 'receita' });
      setItems(res.data);
    } catch {
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  const loadAux = async () => {
    const [o, e, tp] = await Promise.all([
      origensApi.list(),
      etiquetasApi.list(),
      tiposPagamentoApi.list(),
    ]);
    setOrigens(o.data);
    setEtiquetas(e.data);
    setTiposPagamento(tp.data);
    return { origens: o.data, etiquetas: e.data };
  };

  useEffect(() => {
    load();
    loadAux();
  }, []);

  const openCreate = async () => {
    setEditing(null);
    const aux = await loadAux();
    setDescricao('');
    setValor('');
    setDataEvento(new Date().toISOString().split('T')[0]);
    const origemPadrao = aux.origens.find((o: Origem) => o.padrao);
    setOrigemId(origemPadrao?.id || aux.origens[0]?.id || '');
    const etiquetaPadrao = aux.etiquetas.find((e: Etiqueta) => e.padrao);
    setEtiquetaId(etiquetaPadrao?.id || aux.etiquetas[0]?.id || '');
    setTipoPagamentoId(tiposPagamento[0]?.id || '');
    setModalOpen(true);
  };

  const openEdit = (item: Lancamento) => {
    setEditing(item);
    setDescricao(item.descricao);
    setValor(String(item.valor));
    setDataEvento(item.data_evento);
    setOrigemId(item.origem_id || '');
    setEtiquetaId(item.etiqueta_id);
    setTipoPagamentoId(item.tipo_pagamento_id);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      tipo: 'receita' as const,
      descricao,
      valor: parseFloat(valor),
      data_evento: dataEvento,
      origem_id: origemId,
      etiqueta_id: etiquetaId,
      tipo_pagamento_id: tipoPagamentoId,
    };
    try {
      if (editing) {
        await lancamentosApi.update(editing.id, data);
        toast.success('Receita atualizada!');
      } else {
        await lancamentosApi.create(data);
        toast.success('Receita criada!');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Excluir esta receita?')) return;
    try {
      await lancamentosApi.remove(id);
      toast.success('Receita excluída!');
      load();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const total = items.reduce((s, i) => s + parseFloat(String(i.valor)), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-7 w-7 text-green-600" />
            Receitas
          </h1>
          <p className="text-sm text-gray-500">
            Total: <span className="font-semibold text-green-600">{formatCurrency(total)}</span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Receita
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma receita cadastrada" action={
            <button onClick={openCreate} className="btn-primary text-sm">Criar primeira receita</button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Origem</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Etiqueta</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(item.data_evento)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.descricao}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.origem?.nome || '-'}</td>
                    <td className="px-6 py-4">
                      {item.etiqueta && <Badge color={item.etiqueta.cor}>{item.etiqueta.nome}</Badge>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.tipo_pagamento?.nome || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">{formatCurrency(parseFloat(String(item.valor)))}</td>
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
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Receita' : 'Nova Receita'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-field">Descrição</label>
              <input type="text" className="input-field" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>
            <div>
              <label className="label-field">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" className="input-field" value={valor} onChange={(e) => setValor(e.target.value)} required />
            </div>
            <div>
              <label className="label-field">Data do Evento</label>
              <input type="date" className="input-field" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} required />
            </div>
            <div>
              <label className="label-field">Origem</label>
              <select className="input-field" value={origemId} onChange={(e) => setOrigemId(e.target.value)} required>
                <option value="">Selecione...</option>
                {origens.map((o) => (
                  <option key={o.id} value={o.id}>{o.nome}{o.padrao ? ' (Padrão)' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Etiqueta</label>
              <select className="input-field" value={etiquetaId} onChange={(e) => setEtiquetaId(e.target.value)} required>
                <option value="">Selecione...</option>
                {etiquetas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}{e.padrao ? ' (Padrão)' : ''}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label-field">Tipo de Pagamento</label>
              <select className="input-field" value={tipoPagamentoId} onChange={(e) => setTipoPagamentoId(e.target.value)} required>
                <option value="">Selecione...</option>
                {tiposPagamento.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
