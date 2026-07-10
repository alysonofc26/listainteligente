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
  │   └── scanner/       # Scanner OCR e Cupom components
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
SearchService (packages/scrapers)
    ↓
ScraperRegistry.getAll() → Carrefour, Assaí, Atacadão, Pão de Açúcar
    ↓
Cada scraper delega para sua ScraperStrategy:
  ├── Carrefour → VtexApiStrategy (api.catalog_system/pub/products/search)
  ├── Atacadão  → VtexApiStrategy (mesma API)
  ├── Assaí     → NoopStrategy (retorna vazio)
  └── Pão de Açúcar → NoopStrategy (retorna vazio)
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
receipt-normalizer.ts (normalização nomes/unidades/categorias)
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

## Fluxo de Dados — Scrapers (Arquitetura Atual)

```
SearchService.searchAll("arroz")
    ↓
ScraperRegistry.getAll() → [Carrefour, Assaí, Atacadão, Pão de Açúcar]
    ↓
Promise.allSettled(...)
    ├── Carrefour → VtexApiStrategy
    │     └── GET /api/catalog_system/pub/products/search/arroz
    │         → JSON → ProductResult (nome, marca, preço, imagem, disponibilidade)
    ├── Atacadão → VtexApiStrategy
    │     └── GET /api/catalog_system/pub/products/search/arroz
    │         → JSON → ProductResult
    ├── Assaí → NoopStrategy
    │     └── Retorna { products: [], total: 0 }
    └── Pão de Açúcar → NoopStrategy
          └── Retorna { products: [], total: 0 }
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
- Interface `ScraperInterface` comum para todos os scrapers
- `ScraperStrategy` interface separada para as estratégias de busca
- `VtexApiStrategy` consumindo API VTEC Catalog System diretamente (JSON)
- `NoopStrategy` para supermercados sem e-commerce
- Cada scraper instancia sua estratégia internamente
- Registry para descoberta via `ScraperRegistry`
- `Promise.allSettled` para tolerância a falhas

### Estratégias de scraping por prioridade
1. **API JSON nativa** (VTEX Catalog System) — mais confiável e rica
2. **NoopStrategy** — fallback para sites institucionais sem e-commerce
3. (Futuro) GraphQL, JSON-LD, DOM, Regex em ordem decrescente de confiabilidade

### AI Service isolado
- Provider abstraction (GroqProvider implementa AiProvider)
- ContextBuilder serializa dados → Markdown
- System prompt em português brasileiro
- Regras rígidas: nunca inventar preços

### OCR processado 100% no cliente
- Tesseract.js roda no navegador (sem custo de servidor)
- Pré-processamento (escala de cinza + binarização + redimensionamento) antes do OCR
- Pipeline de validação e normalização pós-OCR

## Estrutura do Banco de Dados (Supabase)

Tabelas principais:
- `lists` / `list_items` — Listas de compras
- `receipts` / `receipt_items` — Cupons fiscais escaneados
- `supermarkets` — Supermercados cadastrados
- `product_prices` — Preços históricos (scrapers)
- `categories` — Categorias de produtos
- `profiles` — Gerenciado pelo Supabase Auth

RLS habilitado em todas as tabelas — usuários veem apenas seus próprios dados.
