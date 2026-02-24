'use client';

import { useState, useEffect } from 'react';
import { tiposPagamentoApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import { TipoPagamento } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { PlusIcon, PencilSquareIcon, TrashIcon, CreditCardIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function TiposPagamentoPage() {
  const {
    items,
    loading,
    modalOpen,
    editing,
    openCreate,
    openEdit,
    closeModal,
    save,
    remove,
    reload,
  } = useCrud<TipoPagamento>(tiposPagamentoApi);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<'a_vista' | 'a_prazo'>('a_vista');
  const [parcelas, setParcelas] = useState(1);
  const [taxa, setTaxa] = useState('0');
  const [aplicavelReceita, setAplicavelReceita] = useState(true);
  const [aplicavelDespesa, setAplicavelDespesa] = useState(true);

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setDescricao(editing.descricao || '');
      setModalidade(editing.modalidade);
      setParcelas(editing.parcelas);
      setTaxa(String(editing.taxa ?? 0));
      setAplicavelReceita(editing.aplicavel_receita ?? true);
      setAplicavelDespesa(editing.aplicavel_despesa ?? true);
    } else {
      setNome('');
      setDescricao('');
      setModalidade('a_vista');
      setParcelas(1);
      setTaxa('0');
      setAplicavelReceita(true);
      setAplicavelDespesa(true);
    }
  }, [editing, modalOpen]);

  useEffect(() => {
    if (modalidade === 'a_vista') setParcelas(1);
    else if (parcelas <= 1) setParcelas(2);
  }, [modalidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      nome,
      descricao: descricao || null,
      modalidade,
      parcelas,
      taxa: parseFloat(taxa) || 0,
      aplicavel_receita: aplicavelReceita,
      aplicavel_despesa: aplicavelDespesa,
    });
  };

  const handleSetPadrao = async (id: string, tipo: 'receita' | 'despesa') => {
    try {
      await tiposPagamentoApi.setPadrao(id, tipo);
      toast.success(`Padrão para ${tipo === 'receita' ? 'receitas' : 'despesas'} definido!`);
      reload();
    } catch {
      toast.error('Erro ao definir padrão');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCardIcon className="h-7 w-7 text-primary-600" />
            Tipos de Pagamento
          </h1>
          <p className="text-sm text-gray-500">Gerencie as formas de pagamento</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Novo Tipo</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum tipo de pagamento cadastrado" action={
            <button onClick={openCreate} className="btn-primary text-sm">Criar primeiro tipo</button>
          } />
        ) : (
          <>
            <div className="sm:hidden divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={item.modalidade === 'a_vista' ? 'success' : 'warning'}>
                        {item.modalidade === 'a_vista' ? 'À Vista' : `${item.parcelas}x`}
                      </Badge>
                      {(item.taxa ?? 0) > 0 && (
                        <span className="text-xs text-orange-600 font-medium">{item.taxa}%</span>
                      )}
                      <div className="flex gap-1">
                        {item.aplicavel_receita && <Badge variant="success">R</Badge>}
                        {item.aplicavel_despesa && <Badge variant="danger">D</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleSetPadrao(item.id, 'receita')}
                        className="flex items-center gap-0.5 text-xs text-green-600"
                        title="Definir como padrão para receitas"
                      >
                        {item.padrao_receita
                          ? <StarSolidIcon className="h-3.5 w-3.5 text-green-500" />
                          : <StarIcon className="h-3.5 w-3.5 text-gray-300" />
                        }
                        <span>Rec</span>
                      </button>
                      <button
                        onClick={() => handleSetPadrao(item.id, 'despesa')}
                        className="flex items-center gap-0.5 text-xs text-red-600"
                        title="Definir como padrão para despesas"
                      >
                        {item.padrao_despesa
                          ? <StarSolidIcon className="h-3.5 w-3.5 text-red-500" />
                          : <StarIcon className="h-3.5 w-3.5 text-gray-300" />
                        }
                        <span>Desp</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <button onClick={() => openEdit(item)} className="text-gray-400 active:text-primary-600">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => remove(item.id)} className="text-gray-400 active:text-red-600">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Parcelas</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Taxa</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Aplicável</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Padrão</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.descricao || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={item.modalidade === 'a_vista' ? 'success' : 'warning'}>
                        {item.modalidade === 'a_vista' ? 'À Vista' : 'A Prazo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{item.parcelas}x</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                      {(item.taxa ?? 0) > 0 ? <span className="text-orange-600 font-medium">{item.taxa}%</span> : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.aplicavel_receita && <Badge variant="success">Receita</Badge>}
                        {item.aplicavel_despesa && <Badge variant="danger">Despesa</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSetPadrao(item.id, 'receita')}
                          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                          title="Definir como padrão para receitas"
                        >
                          {item.padrao_receita
                            ? <StarSolidIcon className="h-4 w-4 text-green-500" />
                            : <StarIcon className="h-4 w-4 text-gray-300 hover:text-green-400" />
                          }
                          <span className="text-xs text-green-600">R</span>
                        </button>
                        <button
                          onClick={() => handleSetPadrao(item.id, 'despesa')}
                          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                          title="Definir como padrão para despesas"
                        >
                          {item.padrao_despesa
                            ? <StarSolidIcon className="h-4 w-4 text-red-500" />
                            : <StarIcon className="h-4 w-4 text-gray-300 hover:text-red-400" />
                          }
                          <span className="text-xs text-red-600">D</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Tipo de Pagamento' : 'Novo Tipo de Pagamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome</label>
            <input type="text" className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="label-field">Descrição</label>
            <textarea className="input-field" rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Modalidade</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="modalidade" checked={modalidade === 'a_vista'} onChange={() => setModalidade('a_vista')} className="text-primary-600" />
                <span className="text-sm">À Vista</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="modalidade" checked={modalidade === 'a_prazo'} onChange={() => setModalidade('a_prazo')} className="text-primary-600" />
                <span className="text-sm">A Prazo</span>
              </label>
            </div>
          </div>
          {modalidade === 'a_prazo' && (
            <div>
              <label className="label-field">Parcelas</label>
              <input type="number" className="input-field" min={2} max={48} value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value) || 2)} />
            </div>
          )}
          <div>
            <label className="label-field">Taxa (%)</label>
            <input type="number" step="0.01" min="0" max="100" className="input-field" value={taxa} onChange={(e) => setTaxa(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Aplicável a</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={aplicavelReceita} onChange={(e) => setAplicavelReceita(e.target.checked)} className="text-green-600 rounded" />
                <span className="text-sm text-green-700">Receita</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={aplicavelDespesa} onChange={(e) => setAplicavelDespesa(e.target.checked)} className="text-red-600 rounded" />
                <span className="text-sm text-red-700">Despesa</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
