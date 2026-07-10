# Lista Inteligente — MVP 1.0

## Visão Geral

Assistente inteligente de compras que ajuda o usuário antes, durante e depois das compras no supermercado.

### Antes da compra
- Criar listas de compras inteligentes
- Comparar preços entre supermercados em tempo real via APIs nativas
- Identificar onde cada produto é mais barato

### Durante a compra
- Escanear etiquetas de produtos com OCR (câmera do celular)
- Escanear cupom fiscal completo
- Calcular total da compra

### Depois da compra
- Histórico completo de compras
- Estatísticas e dashboard inteligente
- Análise de gastos por categoria e supermercado
- Sugestões de economia com IA

## Funcionalidades Entregues

### Sprint 1 — Fundação
- Monorepo configurado (npm workspaces)
- Next.js 15 + React 19 + TypeScript + TailwindCSS
- shadcn/ui configurado
- Supabase: schema (10 tabelas + RLS + triggers + seed)
- Autenticação completa (login, cadastro, recuperar senha)
- Layout responsivo (sidebar, header, theme toggle)
- Dashboard inicial com boas-vindas
- Pacotes scaffoldados: types, shared, database, ui, ai, ocr, scrapers

### Sprint 2 — Listas de Compras
- CRUD completo de listas (criar, editar, excluir)
- CRUD completo de itens (adicionar, editar, marcar, excluir)
- Preço estimado por item
- Server Actions (lists.ts, items.ts)
- Price Engine integrado (calculateTotal)
- Componentes: Dialog, Toast, Checkbox, EmptyState, SkeletonCard
- Páginas: /minha-lista, /minha-lista/[id]

### Sprint 3 — OCR
- Plataforma OCR: engine (tesseract.ts), parsers (label-parser, receipt-parser), processor (image-processor)
- Hooks: use-camera, use-ocr
- Componentes: camera-preview, scan-result
- Página: /scanner

### Sprint 4-6 — Scrapers (Arquitetura com Strategy Pattern)
- **ScraperStrategy** — Interface genérica que cada estratégia implementa
- **VtexApiStrategy** — Estratégia que consome a API nativa VTEX Catalog System (`/api/catalog_system/pub/products/search/`) retornando JSON completo: nome, marca, preço, imagem, EAN, disponibilidade, parcelamento
- **NoopStrategy** — Estratégia vazia para supermercados sem e-commerce próprio
- **CarrefourScraper** — Usa VtexApiStrategy com base `carrefour.com.br`
- **AtacadaoScraper** — Usa VtexApiStrategy com base `atacadao.com.br`
- **AssaiScraper** — Usa NoopStrategy (site Drupal institucional sem e-commerce)
- **PaoDeAcucarScraper** — Usa NoopStrategy (API não disponível)
- ScraperRegistry para descoberta
- SearchService para busca agregada com Promise.allSettled
- Todo scraper implementa `ScraperInterface` mantendo compatibilidade com ComparisonService

### Sprint 7 — IA (Groq)
- AiService como entry point único
- GroqProvider implementando AiProvider
- ContextBuilder serializa dados → Markdown
- PromptBuilder com actions específicas
- System prompt em português brasileiro
- Suporte a ações: summary, savings, expensive, budget, explain
- Integração com o pacote shared (formatCurrency)

### Sprint 8 — Scanner de Cupom Fiscal
- Receipt Pipeline: purchase-builder (orquestrador)
- receipt-normalizer (normalização de nomes/unidades/categorias)
- receipt-validator (validação de data/itens/totais)
- Tipos PurchaseResult, ReceiptData
- receipt-parser aprimorado (classificação de linhas, quantidades, dedup)
- Server Actions: saveReceipt, importReceiptItems
- Hook: use-receipt-scanner
- Componente: receipt-result
- Página: /scanner-cupom (câmera → OCR → pipeline → salvar)

### Sprint 9 — Histórico de Compras
- HistoryService, HistoryRepository, HistoryMapper, HistoryFilterBuilder, HistoryExporter
- Tipos: PurchaseSummary, PurchaseDetail, PurchaseItem, HistoryFilter, PaginatedResult
- Server Actions: listPurchases, getPurchaseDetail, deletePurchase, reopenPurchase
- Página: /historico (busca, filtros, paginação, ordenação, excluir, reabrir)
- Página: /historico/[id] (detalhes, OCR raw, reabrir/excluir)

### Sprint 10 — Estatísticas e Dashboard
- ExpenseAggregator, CategoryAggregator, SupermarketAggregator, EconomyAggregator, FrequencyAggregator
- StatisticsCalculator (average, percentage, growth, trend, min, max, round)
- StatisticsRepository (leitura de receipts + items + supermarkets)
- StatisticsService (orquestração dos agregadores)
- StatisticsMapper (para integração com IA)
- Dashboard atualizado com dados reais: cards, supermercados, categorias, evolução mensal, top produtos

### Sprint 11 — Comparador Inteligente
- Price Engine expandido (consolidateComparison, ComparisonSummary, ProductComparison, ComparisonBySupermarket)
- ComparisonService (orquestra listas → scrapers → price engine)
- Comparador integrado com SearchService (scrapers via VTEX API)
- Página /comparador com:
  - Cards de resumo (economia, produtos encontrados, supermercados, melhor supermercado)
  - Tabela comparativa por produto com destaque visual do menor preço
  - Resumo por supermercado com progress bars
  - Produtos não encontrados
  - Recomendações inteligentes da IA (Groq)
- IA integrada com dados reais de comparação
- Responsivo e seguindo o padrão visual do projeto

## APIs e Serviços Conectados

| Serviço | Função | Status |
|---------|--------|--------|
| Supabase (Auth) | Autenticação de usuários | ✅ Conectado |
| Supabase (PostgreSQL) | Banco de dados principal | ✅ Conectado |
| Supabase (Storage) | Armazenamento de imagens | ✅ Conectado |
| Groq API (IA) | Recomendações inteligentes | ✅ Conectado |
| Carrefour (VTEX API) | Consulta de preços em tempo real | ✅ Integrado |
| Atacadão (VTEX API) | Consulta de preços em tempo real | ✅ Integrado |
| Tesseract.js | OCR client-side (etiquetas e cupons) | ✅ Integrado |

## Arquitetura de Pacotes

| Pacote | Responsabilidade |
|--------|------------------|
| types | Tipos TypeScript compartilhados |
| shared | Utilitários (currency, format, validation) |
| database | Cliente Supabase + repositórios |
| price-engine | Motor financeiro (cálculos, economia, comparações) |
| ocr | OCR + parsers + normalizador + validador |
| ai | Integração Groq (provider, prompts, context) |
| scrapers | Scrapers de supermercados (Strategy Pattern) |
| history | Histórico de compras (Service/Repository) |
| statistics | Estatísticas e agregadores |

## Como Usar

1. Crie uma conta em /cadastro
2. Crie uma lista de compras em /minha-lista
3. Adicione produtos com quantidades
4. Vá para /comparador para ver onde cada produto é mais barato
5. Escaneie um cupom fiscal em /scanner-cupom
6. Acompanhe seu histórico em /historico
7. Veja suas estatísticas em /dashboard

## Expansão Futura (Supermercados VTEX)

Extra, PontoFrio e Casas Bahia também utilizam a plataforma VTEX. Como a `VtexApiStrategy` já está implementada e testada, adicionar esses supermercados requer apenas criar um scraper simples que instancie a estratégia com a URL base correta — sem necessidade de escrever novo código de parser ou integração.

## Requisitos Técnicos

- Node.js 18+
- Conta Supabase gratuita
- Chave de API Groq (GROQ_API_KEY)
- Variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY
