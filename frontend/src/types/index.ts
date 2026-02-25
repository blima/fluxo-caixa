export interface User {
  id: string;
  nome: string;
  nome_usuario: string;
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

export interface Loja {
  id: string;
  nome: string;
  matriz: boolean;
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
  taxa: number;
  aplicavel_receita: boolean;
  aplicavel_despesa: boolean;
  padrao_receita: boolean;
  padrao_despesa: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lancamento {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  taxa: number;
  data_lancamento: string;
  data_evento: string;
  origem_id: string | null;
  destino_id: string | null;
  etiqueta_id: string;
  tipo_pagamento_id: string;
  usuario_id: string;
  loja_id: string;
  loja: Loja;
  ativo: boolean;
  origem: Origem | null;
  destino: Destino | null;
  etiqueta: Etiqueta;
  tipo_pagamento: TipoPagamento;
  usuario: { nome: string; nome_usuario: string } | null;
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

export interface ProjecaoMensal {
  mes: string;
  receitas_bruto: number;
  receitas_liquido: number;
  despesas_bruto: number;
  despesas_liquido: number;
}

export interface ExtratoTotais {
  receitas_bruto: number;
  receitas_taxa: number;
  receitas_liquido: number;
  despesas_bruto: number;
  despesas_taxa: number;
  despesas_liquido: number;
}

export interface ExtratoItem {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  data_evento: string;
  valor_bruto: number;
  taxa: number;
  valor_taxa: number;
  valor_liquido: number;
  origem: Origem | null;
  destino: Destino | null;
  etiqueta: Etiqueta;
  tipo_pagamento: TipoPagamento;
  loja: Loja | null;
  usuario: { nome: string; nome_usuario: string } | null;
  created_at: string;
}

export interface ExtratoResponse {
  saldo_inicial: number;
  itens: ExtratoItem[];
  totais: ExtratoTotais;
}
