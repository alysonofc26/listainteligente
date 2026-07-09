# Arquitetura do Lista Inteligente

## Visão Geral

O Lista Inteligente é construído como um monorepo com 11 pacotes independentes, cada um com responsabilidades bem definidas. A comunicação entre pacotes ocorre exclusivamente via imports diretos (npm workspaces) — sem eventos, sem filas, sem acoplamento indesejado.

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

## Diagrama de Módulos

```
apps/web (Next.js 15 - App Router)
  ├── lib/actions/       # Server Actions (gateway de entrada)
  ├── lib/services/      # Serviços de orquestração
  ├── lib/supabase/      # Clientes Supabase (server + browser)
  ├── components/        # Componentes React
  │   ├── layout/        # Sidebar, Header, AuthProvider
  │   ├── ui/            # shadcn/ui components
  │   └── scanner/       # Scanner OCR components
  └── app/               # Páginas (App Router)
      ├── (dashboard)/   # Dashboard, Listas, Histórico, Scanner, Comparador
      ├── login/         # Autenticação
      ├── cadastro/      # Registro
      └── recuperar-senha/

packages/                    # Biblioteca compartilhada
  ├── types/                 # Tipos TypeScript compartilhados
  ├── shared/                # Utilitários (formatCurrency, slugify, etc.)
  ├── database/              # Cliente Supabase + repositórios base
  ├── price-engine/          # Motor financeiro (cálculos, comparações)
  ├── ocr/                   # Plataforma OCR (Tesseract + parsers)
  ├── ai/                    # Integração Groq (provider, prompts, context)
  ├── scrapers/              # Scrapers de supermercados (Strategy Pattern)
  ├── history/               # Histórico de compras (Service/Repository)
  └── statistics/            # Estatísticas e agregadores
```

## Fluxo de Dados — Comparador Inteligente

```
Minha Lista (DB)
    ↓
Server Action (lib/actions/comparador.ts)
    ↓
ComparisonService (lib/services/comparison-service.ts)
    ↓
SearchService (packages/scrapers) → Carrefour, Assaí, Atacadão
    ↓
ProductResult[] padronizados
    ↓
Price Engine (packages/price-engine → consolidateComparison)
    ↓
ComparisonSummary
    ├── → Página /comparador (tabela, economia, supermercados)
    └── → AiService (análise + recomendação inteligente)
            ↓
          /comparador (seção "Recomendações Inteligentes")
```

## Fluxo de Dados — Scanner de Cupom Fiscal

```
Câmera → Tesseract OCR (client-side)
    ↓
receipt-parser.ts (classificação de linhas)
    ↓
receipt-normalizer.ts (normalização nomes/unidades)
    ↓
receipt-validator.ts (validação data/itens/totais)
    ↓
purchase-builder.ts (orquestrador)
    ↓
Server Action → Supabase (receipts + receipt_items)
    ↓
History Module → /historico + /historico/[id]
    ↓
Statistics Module → /dashboard
```

## Fluxo de Dados — Scrapers

```
SearchService.searchAll("arroz")
    ↓
ScraperRegistry.getAll() → [Carrefour, Assaí, Atacadão, Pão de Açúcar]
    ↓
Promise.allSettled(...)
    ├── Carrefour: fetch → CarrefourParser (regex HTML) → CarrefourMapper → ProductResult
    ├── Assaí: fetch → AssaiParser (Drupal views) → AssaiMapper → ProductResult
    ├── Atacadão: fetch → AtacadaoParser (JSON-LD) → AtacadaoMapper → ProductResult
    └── Pão de Açúcar: não implementado
    ↓
AggregatedSearchResult (flat + bySupermarket)
```

## Decisões Arquiteturais

### Monorepo com npm workspaces
- Código compartilhado via `packages/*`
- Sem build steps — `main` aponta direto para `./src/index.ts`
- TypeScript resolve módulos via `moduleResolution: "bundler"`

### Price Engine como fonte única da verdade financeira
- Nenhuma lógica financeira em páginas, componentes, scrapers ou serviços
- Todo cálculo passa pelo price-engine

### Server Actions como camada de API
- Sem REST endpoints
- Server Components para dados iniciais, Server Actions para mutações
- Cliente Supabase SSR para autenticação

### Scrapers com Strategy Pattern
- Interface `ScraperInterface` comum
- Registry para descoberta
- `Promise.allSettled` para tolerância a falhas

### AI Service isolado
- Provider abstraction (GroqProvider implementa AiProvider)
- ContextBuilder serializa dados → Markdown
- System prompt em português brasileiro
- Regras rígidas: nunca inventar preços

## Estrutura do Banco de Dados (Supabase)

Tabelas principais:
- `lists` / `list_items` — Listas de compras
- `receipts` / `receipt_items` — Cupons fiscais escaneados
- `supermarkets` — Supermercados cadastrados
- `product_prices` — Preços históricos (scrapers)
- `categories` — Categorias de produtos
- Profiles (gerenciado pelo Supabase Auth)

RLS habilitado em todas as tabelas — usuários veem apenas seus próprios dados.
