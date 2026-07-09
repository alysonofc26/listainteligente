# Sprint 4 - Scrapers (Carrefour)

## Status: ✅ Concluído

## Objetivos

- [x] Criar interface padronizada `ScraperInterface` como contrato único
- [x] Implementar `ScraperRegistry` para registro centralizado de scrapers
- [x] Implementar `SearchService` como ponto único de busca
- [x] Implementar Carrefour funcional (scraper + parser + mapper + constants + types)
- [x] Arquitetura resiliente: alterações no Carrefour afetam apenas `carrefour/`
- [x] Stubs preparados para Assaí (Sprint 5) e Atacadão (Sprint 6)
- [x] Nenhum acoplamento entre telas e scraper específico
- [x] Price Engine permanece como única fonte de cálculo financeiro

## Estrutura Final

```
packages/scrapers/src/
  interfaces/
    scraper.interface.ts    # Contrato: ScraperInterface, ScraperConfig
    base-scraper.ts         # BaseScraper abstrato (fetch + rate-limit)
  registry/
    scraper-registry.ts     # Registro centralizado de scrapers
  services/
    search.service.ts       # SearchService (ponto único de busca)
  carrefour/
    types.ts                # Tipos específicos do Carrefour
    constants.ts            # URLs, seletores, rate limits
    parser.ts               # Parsing HTML → dados estruturados
    mapper.ts               # Dados específicos → ProductResult padronizado
    scraper.ts              # Orquestração: fetch → parser → mapper
  assai/
    scraper.ts              # Stub (Sprint 5)
  atacadao/
    scraper.ts              # Stub (Sprint 6)
  paodeacucar/
    scraper.ts              # Stub (futuro)
  index.ts                  # API pública
```

## Arquitetura

### Fluxo de Busca

```
SearchService.searchAll("arroz")
    │
    ├── ScraperRegistry.getAll()
    │       │
    │       ├── CarrefourScraper.search("arroz")
    │       │       ├── fetch(URL) → HTML
    │       │       ├── CarrefourParser.parseSearchResults(HTML) → CarrefourParsedProduct[]
    │       │       └── CarrefourMapper.toProductResults(parsed) → ProductResult[]
    │       │
    │       ├── AssaiScraper.search("arroz")      → throw (não implementado)
    │       ├── AtacadaoScraper.search("arroz")   → throw (não implementado)
    │       └── PaoDeAcucarScraper.search("arroz") → throw (não implementado)
    │
    └── Resultado: AggregatedSearchResult
            ├── products: ProductResult[]  (combinado)
            ├── total: number
            └── bySupermarket: Record<slug, { products, total }>
```

### Contrato (ScraperInterface)

```typescript
interface ScraperInterface {
  readonly supermarketId: string;
  search(query: string): Promise<SearchResult>;
  getProduct(url: string): Promise<ProductResult | null>;
}
```

### Dado Padronizado (ProductResult)

```typescript
interface ProductResult {
  id: string;          // hash determinístico: slug(nome)-supermarketId
  name: string;
  brand: string | null;
  price: number;
  unitPrice: number | null;
  image: string | null;
  url: string;
  availability: boolean;
  updatedAt: string;   // ISO timestamp da coleta
}
```

### Resiliência

Se o site do Carrefour mudar, apenas estes arquivos precisam de alteração:

```
packages/scrapers/src/carrefour/
  constants.ts    → Atualizar seletores/URLs
  parser.ts       → Atualizar lógica de parsing
  mapper.ts       → Atualizar mapeamento se necessário
  types.ts        → Atualizar tipos intermediários se necessário
  scraper.ts      → Raramente precisa mudar
```

Nenhum outro módulo do sistema é afetado.

### Como adicionar um novo supermercado

1. Criar pasta `packages/scrapers/src/novo-supermercado/`
2. Criar `types.ts` — tipos específicos do parsing
3. Criar `constants.ts` — URLs, seletores, rate limit
4. Criar `parser.ts` — implementar `parseSearchResults(html, baseUrl)` e `parseProductPage(html, url)`
5. Criar `mapper.ts` — estender `BaseMapper` ou implementar `toProductResult` / `toProductResults`
6. Criar `scraper.ts` — estender `BaseScraper`, implementar `ScraperInterface`
7. Registrar no `ScraperRegistry` (import + entrada no Map)

### Como funciona o Registry

- `ScraperRegistry.get(slug)` — retorna instância do scraper
- `ScraperRegistry.getAll()` — retorna instâncias de todos os scrapers registrados
- `ScraperRegistry.getAvailableSlugs()` — lista slugs disponíveis
- `ScraperRegistry.register(slug, constructor)` — registro dinâmico

### Como funciona o SearchService

- `SearchService.searchAll(query)` — busca em todos os supermercados em paralelo
  - Usa `Promise.allSettled` para que falhas individuais não bloqueiem
  - Retorna `AggregatedSearchResult` com produtos combinados + agrupados
- `SearchService.searchIn(supermarketSlug, query)` — busca em supermercado específico

### Price Engine

A integração com Price Engine permanece intacta. O Scraper **apenas coleta**:

| Quem faz | O que faz |
|----------|-----------|
| Scraper | Coleta preço, nome, imagem, URL |
| SearchService | Agrega resultados multi-supermercado |
| Price Engine | Calcula economia, compara preços, encontra melhor mercado |

## Próximos Passos

Sprint 5 — Assaí: implementar scraper funcional sem alterar arquitetura existente
Sprint 6 — Atacadão: implementar scraper funcional sem alterar arquitetura existente
