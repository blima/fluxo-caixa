'use client';

import { useState, useEffect, useMemo } from 'react';
import { origensApi, destinosApi, etiquetasApi, tiposPagamentoApi, lancamentosApi } from '@/services/api';
import { useLoja } from '@/contexts/LojaContext';
import { Lancamento, Origem, Destino, Etiqueta, TipoPagamento } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import DateInput from '@/components/ui/DateInput';

interface LancamentoModalProps {
  open: boolean;
  onClose: () => void;
  editing: Lancamento | null;
  onSaved: () => void;
  defaultTipo?: 'receita' | 'despesa';
}

export default function LancamentoModal({ open, onClose, editing, onSaved, defaultTipo = 'receita' }: LancamentoModalProps) {
  const { lojaId } = useLoja();
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(defaultTipo);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [origemId, setOrigemId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [etiquetaId, setEtiquetaId] = useState('');
  const [tipoPagamentoId, setTipoPagamentoId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTaxaTooltip, setShowTaxaTooltip] = useState(false);

  const [origens, setOrigens] = useState<Origem[]>([]);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [tiposPagamento, setTiposPagamento] = useState<TipoPagamento[]>([]);

  useEffect(() => {
    if (!open) return;
    const loadAux = async () => {
      const [o, d, e, tp] = await Promise.all([
        origensApi.list(),
        destinosApi.list(),
        etiquetasApi.list(),
        tiposPagamentoApi.list(),
      ]);
      setOrigens(o.data);
      setDestinos(d.data);
      setEtiquetas(e.data);
      setTiposPagamento(tp.data);

      if (editing) {
        setTipo(editing.tipo);
        setDescricao(editing.descricao);
        setValor(String(editing.valor));
        setDataEvento(editing.data_evento);
        setOrigemId(editing.origem_id || '');
        setDestinoId(editing.destino_id || '');
        setEtiquetaId(editing.etiqueta_id);
        setTipoPagamentoId(editing.tipo_pagamento_id);
      } else {
        setTipo(defaultTipo);
        setDescricao('');
        setValor('');
        setDataEvento(new Date().toISOString().split('T')[0]);
        const origemPadrao = o.data.find((or: Origem) => or.padrao);
        setOrigemId(origemPadrao?.id || o.data[0]?.id || '');
        const destinoPadrao = d.data.find((de: Destino) => de.padrao);
        setDestinoId(destinoPadrao?.id || d.data[0]?.id || '');
        const etiquetaPadrao = e.data.find((et: Etiqueta) => et.padrao);
        setEtiquetaId(etiquetaPadrao?.id || e.data[0]?.id || '');
        const tpPadrao = tp.data.find((t: TipoPagamento) =>
          defaultTipo === 'receita' ? t.padrao_receita : t.padrao_despesa
        );
        setTipoPagamentoId(tpPadrao?.id || tp.data[0]?.id || '');
      }
    };
    loadAux();
    setShowTaxaTooltip(false);
  }, [open, editing, defaultTipo]);

  // Filtra tipos de pagamento por aplicabilidade
  const tiposPagamentoFiltrados = useMemo(() => {
    return tiposPagamento.filter((tp) =>
      tipo === 'receita' ? tp.aplicavel_receita : tp.aplicavel_despesa
    );
  }, [tiposPagamento, tipo]);

  // Atualiza tipo_pagamento_id quando troca receita/despesa — sempre busca o padrão do tipo
  useEffect(() => {
    if (!editing && tiposPagamentoFiltrados.length > 0) {
      const padrao = tiposPagamentoFiltrados.find((tp) =>
        tipo === 'receita' ? tp.padrao_receita : tp.padrao_despesa
      );
      setTipoPagamentoId(padrao?.id || tiposPagamentoFiltrados[0].id);
    }
  }, [tipo, editing]);

  // Taxa do tipo de pagamento selecionado
  const tipoPagamentoSelecionado = tiposPagamento.find((t) => t.id === tipoPagamentoId);
  const taxaAtual = tipoPagamentoSelecionado?.taxa ?? 0;

  // Cálculos em tempo real
  const valorNum = parseFloat(valor) || 0;
  const valorTaxa = valorNum * taxaAtual / 100;
  const valorLiquido = tipo === 'receita' ? valorNum - valorTaxa : valorNum + valorTaxa;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data: any = {
      tipo,
      descricao,
      valor: parseFloat(valor),
      data_evento: dataEvento,
      etiqueta_id: etiquetaId,
      tipo_pagamento_id: tipoPagamentoId,
      loja_id: lojaId,
    };
    if (tipo === 'receita') {
      data.origem_id = origemId;
      data.destino_id = null;
    } else {
      data.destino_id = destinoId;
      data.origem_id = null;
    }
    try {
      if (editing) {
        await lancamentosApi.update(editing.id, data);
        toast.success('Lançamento atualizado!');
        onSaved();
        onClose();
      } else {
        await lancamentosApi.create(data);
        toast.success('Lançamento criado!');
        onSaved();
        // Limpa campos mas mantém a loja selecionada e a tela aberta
        setDescricao('');
        setValor('');
        setDataEvento(new Date().toISOString().split('T')[0]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar Lançamento' : 'Novo Lançamento'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Receita/Despesa */}
        <div>
          <label className="label-field">Tipo</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              type="button"
              onClick={() => setTipo('receita')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tipo === 'receita'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setTipo('despesa')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tipo === 'despesa'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Despesa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <label className="label-field">Descrição</label>
            <input type="text" className="input-field" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Valor (R$)</label>
            <input type="number" step="0.01" min="0.01" className="input-field" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Data do Evento</label>
            <DateInput value={dataEvento} onChange={setDataEvento} required />
          </div>

          {/* Origem (só receita) ou Destino (só despesa) */}
          {tipo === 'receita' ? (
            <div>
              <label className="label-field">Origem</label>
              <select className="input-field" value={origemId} onChange={(e) => setOrigemId(e.target.value)} required>
                <option value="">Selecione...</option>
                {origens.map((o) => (
                  <option key={o.id} value={o.id}>{o.nome}{o.padrao ? ' (Padrão)' : ''}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label-field">Destino</label>
              <select className="input-field" value={destinoId} onChange={(e) => setDestinoId(e.target.value)} required>
                <option value="">Selecione...</option>
                {destinos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}{d.padrao ? ' (Padrão)' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label-field">Etiqueta</label>
            <select className="input-field" value={etiquetaId} onChange={(e) => setEtiquetaId(e.target.value)} required>
              <option value="">Selecione...</option>
              {etiquetas.map((et) => (
                <option key={et.id} value={et.id}>{et.nome}{et.padrao ? ' (Padrão)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="label-field">Tipo de Pagamento</label>
            <div className="relative flex items-center gap-2">
              <select className="input-field flex-1" value={tipoPagamentoId} onChange={(e) => setTipoPagamentoId(e.target.value)} required>
                <option value="">Selecione...</option>
                {tiposPagamentoFiltrados.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.nome}{(tipo === 'receita' ? tp.padrao_receita : tp.padrao_despesa) ? ' (Padrão)' : ''}</option>
                ))}
              </select>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTaxaTooltip(!showTaxaTooltip)}
                  onBlur={() => setTimeout(() => setShowTaxaTooltip(false), 200)}
                  className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                  title="Ver taxa"
                >
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
                {showTaxaTooltip && tipoPagamentoSelecionado && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10">
                    <div className="font-semibold mb-1">{tipoPagamentoSelecionado.nome}</div>
                    <div>Taxa: <span className="text-orange-300 font-medium">{taxaAtual}%</span></div>
                    {tipoPagamentoSelecionado.modalidade === 'a_prazo' && (
                      <div>Parcelas: {tipoPagamentoSelecionado.parcelas}x</div>
                    )}
                    <div className="absolute right-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resumo bruto/líquido */}
        {valorNum > 0 && taxaAtual > 0 && (
          <div className={`rounded-lg p-3 text-sm ${tipo === 'receita' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Bruto:</span>
              <span className="font-medium">{formatCurrency(valorNum)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa ({taxaAtual}%):</span>
              <span className="font-medium text-orange-600">-{formatCurrency(valorTaxa)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 mt-1 pt-1">
              <span className="font-semibold text-gray-700">Valor Líquido:</span>
              <span className={`font-bold ${tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(valorLiquido)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
