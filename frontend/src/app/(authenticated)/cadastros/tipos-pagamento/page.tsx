'use client';

import { useState, useEffect } from 'react';
import { tiposPagamentoApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import { TipoPagamento } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  } = useCrud<TipoPagamento>(tiposPagamentoApi);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<'a_vista' | 'a_prazo'>('a_vista');
  const [parcelas, setParcelas] = useState(1);

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setDescricao(editing.descricao || '');
      setModalidade(editing.modalidade);
      setParcelas(editing.parcelas);
    } else {
      setNome('');
      setDescricao('');
      setModalidade('a_vista');
      setParcelas(1);
    }
  }, [editing, modalOpen]);

  useEffect(() => {
    if (modalidade === 'a_vista') setParcelas(1);
    else if (parcelas <= 1) setParcelas(2);
  }, [modalidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ nome, descricao: descricao || null, modalidade, parcelas });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Pagamento</h1>
          <p className="text-sm text-gray-500">Gerencie as formas de pagamento</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo Tipo
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Parcelas</th>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Editar">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Excluir">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
