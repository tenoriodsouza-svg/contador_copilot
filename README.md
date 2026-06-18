# Contador Copilot

Assistente inteligente para contadores autônomos, freelancers e pequenos escritórios contábeis.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/UI
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **IA:** OpenAI API (resumo de documentos + chat assistente)

## Funcionalidades

- Autenticação completa (cadastro, login, logout, recuperação de senha)
- Dashboard com métricas e resumo rápido
- CRUD de clientes com busca e filtros
- Upload de documentos (PDF, XML, JPG, PNG) com resumo automático via IA
- Gestão de pendências com prioridades e status
- Calendário contábil de obrigações e vencimentos
- Notificações automáticas (atrasos, vencimentos, certificados)
- Controle financeiro de mensalidades
- Assistente IA para dúvidas contábeis
- Relatórios exportáveis em PDF

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor
3. Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Deploy das Edge Functions

```bash
supabase functions deploy summarize-document
supabase functions deploy ai-assistant
supabase functions deploy generate-notifications
```

Configure os secrets no painel Supabase:

```
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Executar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

## Estrutura

```
src/
├── components/     # UI, layout, módulos
├── pages/          # Rotas da aplicação
├── hooks/          # React Query hooks
├── lib/            # Supabase, validators, utils, reports
├── types/          # TypeScript types do banco
└── contexts/       # Auth context

supabase/
├── migrations/     # Schema SQL
└── functions/      # Edge Functions (IA + notificações)
```

## Segurança

- Row Level Security (RLS) em todas as tabelas
- Cada usuário vê apenas seus próprios dados
- API key da OpenAI apenas nas Edge Functions (nunca no frontend)
- Storage privado com policies por usuário
