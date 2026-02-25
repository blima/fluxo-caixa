'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lojasApi } from '@/services/api';
import { Loja } from '@/types';

interface LojaContextType {
  lojas: Loja[];
  lojaId: string;
  setLojaId: (id: string) => void;
  lojaAtual: Loja | undefined;
}

const LojaContext = createContext<LojaContextType>({
  lojas: [],
  lojaId: '',
  setLojaId: () => {},
  lojaAtual: undefined,
});

export function LojaProvider({ children }: { children: ReactNode }) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaId, setLojaId] = useState('');

  useEffect(() => {
    lojasApi.list().then((res) => {
      const ativas = (res.data as Loja[]).filter((l: Loja) => l.ativo);
      setLojas(ativas);
      const matriz = ativas.find((l: Loja) => l.matriz);
      if (matriz) setLojaId(matriz.id);
      else if (ativas.length > 0) setLojaId(ativas[0].id);
    });
  }, []);

  const lojaAtual = lojas.find((l) => l.id === lojaId);

  return (
    <LojaContext.Provider value={{ lojas, lojaId, setLojaId, lojaAtual }}>
      {children}
    </LojaContext.Provider>
  );
}

export function useLoja() {
  return useContext(LojaContext);
}
