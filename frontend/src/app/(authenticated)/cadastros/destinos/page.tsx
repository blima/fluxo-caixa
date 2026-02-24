'use client';

import { useState, useEffect } from 'react';
import { destinosApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import { Destino } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function DestinosPage() {
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
    setPadrao,
  } = useCrud<Destino>(destinosApi);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setDescricao(editing.descricao || '');
    } else {
      setNome('');
      setDescricao('');
    }
  }, [editing, modalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ nome, descricao: descricao || null });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinos</h1>
          <p className="text-sm text-gray-500">
            Gerencie os destinos das despesas
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo Destino
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState
            message="Nenhum destino cadastrado"
            action={
              <button onClick={openCreate} className="btn-primary text-sm">
                Criar primeiro destino
              </button>
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
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
                    {item.padrao ? <Badge variant="primary">Padrão</Badge> : null}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setPadrao(item.id)} className="text-gray-400 hover:text-yellow-500 transition-colors" title="Definir como padrão">
                        {item.padrao ? <StarSolidIcon className="h-5 w-5 text-yellow-500" /> : <StarIcon className="h-5 w-5" />}
                      </button>
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Destino' : 'Novo Destino'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome</label>
            <input type="text" className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="label-field">Descrição</label>
            <textarea className="input-field" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
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
