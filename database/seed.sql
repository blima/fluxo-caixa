-- ============================================
-- Fluxo de Caixa - Dados Iniciais (Seed)
-- ============================================

-- Usuário admin (senha: admin123)
-- Hash bcrypt para 'admin123'
INSERT INTO users (nome, email, senha_hash)
VALUES ('Administrador', 'admin@fluxo.com', '$2b$10$8KzaNdKIMyOkASCBkeRsKOnrr2mLJMheMCl2fEuPJFBVi6UBMqOYu');

-- Origens padrão
INSERT INTO origens (nome, descricao, padrao) VALUES
('Vendas', 'Receitas provenientes de vendas', TRUE),
('Serviços', 'Receitas provenientes de serviços prestados', FALSE),
('Investimentos', 'Retorno de investimentos', FALSE);

-- Destinos padrão
INSERT INTO destinos (nome, descricao, padrao) VALUES
('Fornecedores', 'Pagamentos a fornecedores', TRUE),
('Funcionários', 'Folha de pagamento e encargos', FALSE),
('Impostos', 'Pagamento de impostos e taxas', FALSE);

-- Etiquetas padrão
INSERT INTO etiquetas (nome, descricao, cor, padrao) VALUES
('Operacional', 'Operações do dia a dia', '#3B82F6', TRUE),
('Investimento', 'Investimentos e aquisições', '#10B981', FALSE),
('Financeiro', 'Operações financeiras', '#F59E0B', FALSE),
('Pessoal', 'Despesas pessoais', '#EF4444', FALSE);

-- Tipos de pagamento padrão
INSERT INTO tipos_pagamento (nome, descricao, modalidade, parcelas) VALUES
('Dinheiro', 'Pagamento em dinheiro', 'a_vista', 1),
('PIX', 'Transferência via PIX', 'a_vista', 1),
('Cartão de Débito', 'Pagamento com cartão de débito', 'a_vista', 1),
('Cartão de Crédito 1x', 'Pagamento com cartão à vista', 'a_vista', 1),
('Cartão de Crédito 2x', 'Parcelamento em 2 vezes', 'a_prazo', 2),
('Cartão de Crédito 3x', 'Parcelamento em 3 vezes', 'a_prazo', 3),
('Cartão de Crédito 6x', 'Parcelamento em 6 vezes', 'a_prazo', 6),
('Cartão de Crédito 12x', 'Parcelamento em 12 vezes', 'a_prazo', 12),
('Boleto', 'Pagamento via boleto bancário', 'a_vista', 1),
('Transferência Bancária', 'Transferência entre contas', 'a_vista', 1);
