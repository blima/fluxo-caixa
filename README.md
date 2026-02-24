# Fluxo de Caixa

Sistema web de controle de fluxo de caixa com receitas, despesas, cadastros auxiliares e dashboard com gráficos.

## Stack

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Tremor.so
- **Auth**: JWT (bcrypt + passport-jwt)

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Banco de Dados

```bash
# Criar o banco
createdb fluxo_caixa

# Executar schema
psql -d fluxo_caixa -f database/schema.sql

# Executar seed (admin@fluxo.com / admin123)
psql -d fluxo_caixa -f database/seed.sql
```

### 2. Backend

```bash
cd backend
npm install
npm run start:dev    # http://localhost:3001
```

Variáveis de ambiente opcionais:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_USER` (default: postgres)
- `DB_PASS` (default: postgres)
- `DB_NAME` (default: fluxo_caixa)
- `JWT_SECRET` (default: fluxo-caixa-jwt-secret-2024)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

## Login

- **Email**: admin@fluxo.com
- **Senha**: admin123

## Funcionalidades

- Autenticação JWT
- Cadastro de Origens, Destinos, Etiquetas e Tipos de Pagamento
- Lançamentos de Receitas e Despesas separados
- Dashboard com gráficos (BarChart, AreaChart, DonutChart)
- Filtro por período no dashboard
- Soft delete em todos os registros
- Pré-seleção de itens padrão nos formulários
