'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface CrudApi {
  list: () => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
  setPadrao?: (id: string, ...args: any[]) => Promise<any>;
}

export function useCrud<T extends { id: string }>(api: CrudApi) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list();
      setItems(res.data);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = async (data: any) => {
    try {
      if (editing) {
        await api.update(editing.id, data);
        toast.success('Atualizado com sucesso!');
      } else {
        await api.create(data);
        toast.success('Criado com sucesso!');
      }
      closeModal();
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Deseja realmente excluir?')) return;
    try {
      await api.remove(id);
      toast.success('Excluído com sucesso!');
      await load();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const setPadrao = async (id: string) => {
    if (!api.setPadrao) return;
    try {
      await api.setPadrao(id);
      toast.success('Padrão definido!');
      await load();
    } catch {
      toast.error('Erro ao definir padrão');
    }
  };

  return {
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
    reload: load,
  };
}
