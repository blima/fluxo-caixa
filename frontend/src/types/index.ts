export interface User {
  id: string;
  nome: string;
  email: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Origem {
  id: string;
  nome: string;
  descricao: string | null;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Destino {
  id: string;
  nome: string;
  descricao: string | null;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Etiqueta {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  padrao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoPagamento {
  id: string;
  nome: string;
  descricao: string | null;
  modalidade: 'a_vista' | 'a_prazo';
  parcelas: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lancamento {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data_lancamento: string;
  data_evento: string;
  origem_id: string | null;
  destino_id: string | null;
  etiqueta_id: string;
  tipo_pagamento_id: string;
  usuario_id: string;
  ativo: boolean;
  origem: Origem | null;
  destino: Destino | null;
  etiqueta: Etiqueta;
  tipo_pagamento: TipoPagamento;
  created_at: string;
  updated_at: string;
}

export interface DashboardResumo {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
  total_lancamentos: number;
}

export interface ReceitaDespesaMensal {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface DadosPorCategoria {
  nome: string;
  valor: number;
  cor?: string;
  tipo?: string;
  quantidade?: number;
}

export interface SaldoDiario {
  data: string;
  saldo: number;
}
