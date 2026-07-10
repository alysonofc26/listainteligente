# Lista Inteligente

Assistente inteligente de compras — compare preços, escaneie produtos e cupons, acompanhe gastos e economize com IA.

> **Versão:** 1.0.0 (MVP)

---

## Funcionalidades

- **Listas de compras** — Crie e gerencie listas com quantidades e preços estimados
- **Comparador Inteligente** — Compare preços em tempo real entre supermercados via APIs nativas (VTEX Catalog API)
- **Scanner OCR** — Escaneie etiquetas de produtos usando a câmera do celular com reconhecimento de texto (Tesseract.js)
- **Scanner de Cupom Fiscal** — Fotografe cupons fiscais e extraia todos os itens, preços e totais automaticamente
- **Histórico de compras** — Consulte, filtre e reabra compras anteriores
- **Dashboard** — Estatísticas de gastos por categoria, supermercado e evolução mensal
- **IA (Groq)** — Recomendações inteligentes baseadas nos seus dados reais de comparação

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS |
| UI | shadcn/ui, Lucide Icons, Radix UI |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| OCR | Tesseract.js (client-side) |
| IA | Groq API (llama-3.3-70b-versatile) |
| Hospedagem | Vercel |
| Código | GitHub, npm workspaces |

## Estrutura

```
/
├── apps/web/              # Next.js 15 App Router
│   ├── app/               # Páginas (App Router)
│   ├── components/        # Componentes React (layout, scanner, ui)
│   └── lib/               # Server Actions, serviços, cliente Supabase
├── packages/
│   ├── types/             # Tipos TypeScript compartilhados
│   ├── shared/            # Utilitários (formatCurrency, validação)
│   ├── database/          # Cliente Supabase + repositórios
│   ├── price-engine/      # Motor financeiro (cálculos, economia, comparações)
│   ├── ocr/               # OCR + parsers + normalizador + validador
│   ├── ai/                # Integração Groq (provider, prompts, context)
│   ├── scrapers/          # Scrapers de supermercados (Strategy Pattern + VTEX API)
│   ├── history/           # Histórico de compras (Service/Repository)
│   └── statistics/        # Estatísticas e agregadores
├── docs/                  # Documentação técnica
└── supabase/              # Schema SQL do banco
```

## Pré-requisitos

- Node.js 18+
- Conta gratuita no [Supabase](https://supabase.com)
- Chave de API [Groq](https://console.groq.com) (gratuita)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/lista-inteligente.git
cd lista-inteligente

# Instale as dependências
npm install

# Copie as variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
```

Configure as variáveis em `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
GROQ_API_KEY=sua-chave-groq
```

## Banco de Dados

Execute o schema SQL em `supabase/schema.sql` no SQL Editor do Supabase.

Isso criará:
- 10 tabelas (lists, list_items, receipts, receipt_items, supermarkets, etc.)
- Row Level Security (RLS) em todas as tabelas
- Triggers para updated_at automático
- Seed data com supermercados e categorias

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Typecheck em todos os pacotes
npm run typecheck

# Build completo
npm run build
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia Next.js em modo dev |
| `npm run build` | Build de produção |
| `npm run lint` | Lint no Next.js |
| `npm run typecheck` | Typecheck na web app |
| `npm run clean` | Limpa node_modules e .next |

## Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente no dashboard da Vercel
3. Deploy automático em cada push na main

## Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/recuperar-senha` | Recuperação de senha |
| `/dashboard` | Dashboard com estatísticas |
| `/minha-lista` | Listas de compras |
| `/minha-lista/[id]` | Detalhes da lista |
| `/scanner` | Scanner OCR de produtos |
| `/scanner-cupom` | Scanner de cupom fiscal |
| `/historico` | Histórico de compras |
| `/historico/[id]` | Detalhes da compra |
| `/comparador` | Comparador inteligente |
| `/perfil` | Perfil do usuário |
| `/configuracoes` | Configurações |

## Documentação

- [Arquitetura](docs/architecture/ARQUITETURA.md) — Módulos, fluxos e decisões técnicas
- [MVP 1.0](docs/MVP-1.0.md) — Funcionalidades entregues em cada sprint
- [Schema do BD](docs/database/schema.md) — Estrutura do banco de dados

## Roadmap Futuro

- Notificações de promoções
- **Suporte a mais supermercados VTEX** — Extra, PontoFrio e Casas Bahia também usam VTEX e podem ser integrados rapidamente reaproveitando a `VtexApiStrategy`
- App mobile (React Native)
- Compartilhamento de listas
- Metas de economia
- Integração com carteiras digitais
- Modo off-line
- Sugestão automática de reposição

## Licença

MIT
