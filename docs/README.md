# Lista Inteligente

Assistente inteligente de compras que ajuda você antes, durante e depois das compras.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **UI:** shadcn/ui, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **OCR:** Tesseract.js (client-side)
- **IA:** Groq API (llama-3.3-70b-versatile)
- **Scrapers:** VTEX Catalog API (Carrefour, Atacadão), Strategy Pattern
- **Hospedagem:** Vercel

## Estrutura

```
/
├── apps/
│   └── web/              # Next.js 15 App Router
├── packages/
│   ├── types/             # Tipos TypeScript compartilhados
│   ├── shared/            # Utilitários (currency, format, validation)
│   ├── database/          # Cliente Supabase + repositórios
│   ├── price-engine/      # Motor financeiro (cálculos, economia, comparações)
│   ├── ocr/               # OCR + parsers + normalizador + validador
│   ├── ai/                # Integração Groq (provider, prompts, context)
│   ├── scrapers/          # Scrapers de supermercados (VtexApiStrategy, NoopStrategy)
│   ├── history/           # Histórico de compras (Service/Repository)
│   └── statistics/        # Estatísticas e agregadores
├── docs/                  # Documentação
└── supabase/              # Schema SQL do banco
```

## Documentação Principal

- [Arquitetura](architecture/ARQUITETURA.md) — Módulos, fluxos e decisões técnicas
- [MVP 1.0](../MVP-1.0.md) — Funcionalidades entregues por sprint
- [Schema do BD](database/schema.md) — Estrutura do banco de dados

## Começando

```bash
npm install
npm run dev
```
