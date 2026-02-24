-- ============================================
-- Fluxo de Caixa - Schema PostgreSQL
-- ============================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE modalidade_enum AS ENUM ('a_vista', 'a_prazo');
CREATE TYPE tipo_lancamento_enum AS ENUM ('receita', 'despesa');

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABELA: origens
-- ============================================
CREATE TABLE origens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: apenas 1 origem padrão ativa
CREATE UNIQUE INDEX idx_origens_padrao
    ON origens (padrao)
    WHERE padrao = TRUE AND ativo = TRUE;

-- ============================================
-- TABELA: destinos
-- ============================================
CREATE TABLE destinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: apenas 1 destino padrão ativo
CREATE UNIQUE INDEX idx_destinos_padrao
    ON destinos (padrao)
    WHERE padrao = TRUE AND ativo = TRUE;

-- ============================================
-- TABELA: etiquetas
-- ============================================
CREATE TABLE etiquetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    padrao BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: apenas 1 etiqueta padrão ativa
CREATE UNIQUE INDEX idx_etiquetas_padrao
    ON etiquetas (padrao)
    WHERE padrao = TRUE AND ativo = TRUE;

-- ============================================
-- TABELA: tipos_pagamento
-- ============================================
CREATE TABLE tipos_pagamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    modalidade modalidade_enum NOT NULL DEFAULT 'a_vista',
    parcelas INTEGER NOT NULL DEFAULT 1,
    taxa DECIMAL(5,2) NOT NULL DEFAULT 0,
    aplicavel_receita BOOLEAN NOT NULL DEFAULT TRUE,
    aplicavel_despesa BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_parcelas_modalidade CHECK (
        (modalidade = 'a_vista' AND parcelas = 1)
        OR
        (modalidade = 'a_prazo' AND parcelas > 1)
    )
);

-- ============================================
-- TABELA: lancamentos
-- ============================================
CREATE TABLE lancamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_lancamento_enum NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    taxa DECIMAL(5,2) NOT NULL DEFAULT 0,
    data_lancamento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_evento DATE NOT NULL DEFAULT CURRENT_DATE,
    origem_id UUID REFERENCES origens(id),
    destino_id UUID REFERENCES destinos(id),
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id),
    tipo_pagamento_id UUID NOT NULL REFERENCES tipos_pagamento(id),
    usuario_id UUID NOT NULL REFERENCES users(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_lancamento_origem_destino CHECK (
        (tipo = 'receita' AND origem_id IS NOT NULL)
        OR
        (tipo = 'despesa' AND destino_id IS NOT NULL)
    )
);

-- Índices para performance
CREATE INDEX idx_lancamentos_tipo ON lancamentos(tipo);
CREATE INDEX idx_lancamentos_data_evento ON lancamentos(data_evento);
CREATE INDEX idx_lancamentos_usuario ON lancamentos(usuario_id);
CREATE INDEX idx_lancamentos_etiqueta ON lancamentos(etiqueta_id);
CREATE INDEX idx_lancamentos_ativo ON lancamentos(ativo);
