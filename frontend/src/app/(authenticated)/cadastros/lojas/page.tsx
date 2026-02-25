'use client';

import { useState, useEffect } from 'react';
import { lojasApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { PlusIcon, PencilSquareIcon, BuildingStorefrontIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Loja {
  id: string;
  nome: string;
  matriz: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function LojasPage() {
  const {
    items,
    loading,
    modalOpen,
    editing,
    openCreate,
    openEdit,
    closeModal,
    save,
  } = useCrud<Loja>(lojasApi as any);

  const [nome, setNome] = useState('');
  const [matriz, setMatriz] = useState(false);
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setMatriz(editing.matriz);
      setAtivo(editing.ativo);
    } else {
      setNome('');
      setMatriz(false);
      setAtivo(true);
    }
  }, [editing, modalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ nome, matriz, ativo });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingStorefrontIcon className="h-7 w-7 text-primary-600" />
            Lojas
          </h1>
          <p className="text-sm text-gray-500">Gerencie as lojas do sistema</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Nova Loja</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma loja cadastrada" action={
            <button onClick={openCreate} className="btn-primary text-sm">Criar primeira loja</button>
          } />
        ) : (
          <>
            <div className="sm:hidden divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                      {item.matriz && (
                        <StarSolidIcon className="h-4 w-4 text-amber-500" title="Matriz" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.ativo ? 'success' : 'danger'}>
                        {item.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                      {item.matriz && <Badge variant="warning">Matriz</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <button onClick={() => openEdit(item)} className="text-gray-400 active:text-primary-600">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Matriz</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {item.nome}
                        {item.matriz && <StarSolidIcon className="h-4 w-4 text-amber-500" title="Matriz" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.matriz ? <Badge variant="warning">Matriz</Badge> : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={item.ativo ? 'success' : 'danger'}>
                        {item.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Loja' : 'Nova Loja'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome</label>
            <input type="text" className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={matriz} onChange={(e) => setMatriz(e.target.checked)} className="text-amber-600 rounded" />
              <span className="text-sm text-gray-700">Matriz</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="text-green-600 rounded" />
              <span className="text-sm text-gray-700">Ativa</span>
            </label>
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
