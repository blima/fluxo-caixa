'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/services/api';
import { useCrud } from '@/hooks/useCrud';
import { User } from '@/types';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function UsuariosPage() {
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
  } = useCrud<User>(usersApi);

  const [nome, setNome] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  useEffect(() => {
    if (editing) {
      setNome(editing.nome);
      setNomeUsuario(editing.nome_usuario);
      setEmail(editing.email);
      setSenha('');
    } else {
      setNome('');
      setNomeUsuario('');
      setEmail('');
      setSenha('');
    }
  }, [editing, modalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { nome, nome_usuario: nomeUsuario, email };
    if (senha) data.senha = senha;
    save(data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="h-7 w-7 text-primary-600" />
            Usuários
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie os usuários do sistema
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <Loading />
        ) : items.length === 0 ? (
          <EmptyState
            message="Nenhum usuário cadastrado"
            action={
              <button onClick={openCreate} className="btn-primary text-sm">
                Criar primeiro usuário
              </button>
            }
          />
        ) : (
          <>
            <div className="sm:hidden divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">@{item.nome_usuario} &middot; {item.email}</p>
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">@{item.nome_usuario}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nome</label>
            <input
              type="text"
              className="input-field"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label-field">Nome de Usuário</label>
            <input
              type="text"
              className="input-field"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value.toLowerCase().replace(/\s/g, ''))}
              required
              minLength={3}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="ex: joao.silva"
            />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">
              {editing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
            </label>
            <input
              type="password"
              className="input-field"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required={!editing}
              minLength={6}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
