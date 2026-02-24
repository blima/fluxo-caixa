'use client';

import { useState, useEffect } from 'react';
import { etiquetasApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import { Etiqueta } from '@/types';
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

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

export default function EtiquetasPage() {
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
  } = useCrud<Etiqueta>(etiquetasApi);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState('#3B82F6');

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setDescricao(editing.descricao || '');
      setCor(editing.cor);
    } else {
      setNome('');
      setDescricao('');
      setCor('#3B82F6');
    }
  }, [editing, modalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save({ nome, descricao: descricao || null, cor });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etiquetas</h1>
          <p className="text-sm text-gray-500">Categorize seus lançamentos</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nova Etiqueta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma etiqueta cadastrada" action={
            <button onClick={openCreate} className="btn-primary text-sm">Criar primeira etiqueta</button>
          } />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Padrão</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: item.cor }} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <Badge color={item.cor}>{item.nome}</Badge>
                  </td>
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Etiqueta' : 'Nova Etiqueta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome</label>
            <input type="text" className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="label-field">Descrição</label>
            <textarea className="input-field" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Cor</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      cor === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
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
