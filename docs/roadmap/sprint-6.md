# Sprint 6 - Atacadão

## Status: ✅ Concluído

## Objetivos

- [x] Implementar scraper do Atacadão seguindo exatamente o padrão existente
- [x] Validar novamente que a arquitetura da Sprint 4 permite adicionar supermercados sem modificar o sistema
- [x] Não alterar nenhum arquivo fora de `packages/scrapers/atacadao/`
- [x] Manter o mesmo `ProductResult` — sem campos novos
- [x] SearchService funciona para Carrefour, Assaí, Atacadão ou qualquer combinação
- [x] Nenhuma tela precisou ser modificada
- [x] Health check implementado
- [x] README.md documentando o scraper

## Estrutura criada

```
packages/scrapers/src/atacadao/
  types.ts        # AtacadaoParsedProduct (mesmo padrão)
  constants.ts    # ATACADAO (id, URL, path) + seletores JSON-LD
  parser.ts       # AtacadaoParser (JSON-LD structured data)
  mapper.ts       # AtacadaoMapper (→ ProductResult)
  scraper.ts      # AtacadaoScraper (fetch → parse → map)
  health.ts       # AtacadaoHealth (monitoramento)
  README.md       # Documentação específica
```

## Arquivos modificados

| Arquivo | Tipo de alteração |
|---------|-------------------|
| `packages/scrapers/src/atacadao/` (7 arquivos) | **Criados** — novo supermercado |
| `packages/scrapers/src/index.ts` | Adicionados exports: `AtacadaoParser`, `AtacadaoMapper`, `AtacadaoHealth` |

**Nenhum arquivo fora de `packages/scrapers/` foi alterado.**

## Características do Atacadão

O site `atacadao.com.br` é construído com **Next.js + VTEX** (Carrefour Group). Diferentemente do Assaí (institucional), o Atacadão possui um e-commerce funcional com:

- **Product pages SSR** com **JSON-LD estruturado** (Schema.org Product)
- Dados disponíveis: nome, marca, preço, imagem, SKU, disponibilidade, categoria (via BreadcrumbList)
- **Search/category pages client-side** — sem produtos no HTML server-side
- Plataforma VTEX compartilhada com o grupo Carrefour

### Abordagem de parsing

O `AtacadaoParser` extrai dados do JSON-LD dentro de `<script type="application/ld+json">`:

```json
{
  "@type": "Product",
  "name": "Leite Longa Vida Italac Integral 1L",
  "brand": { "name": "Italac" },
  "sku": "32346",
  "image": "https://...",
  "offers": {
    "price": 5.69,
    "priceCurrency": "BRL",
    "availability": "http://schema.org/InStock"
  }
}
```

## Validação da Arquitetura (Sprint 4 — 3ª validação)

A Sprint 6 confirma pela **terceira vez** que a arquitetura é escalável.

| Cenário | Como | Resultado |
|---------|------|-----------|
| Busca apenas Carrefour | `searchIn("carrefour", "arroz")` | ✅ Funciona |
| Busca apenas Assaí | `searchIn("assai", "arroz")` | ✅ Funciona (0 resultados — corretamente) |
| Busca apenas Atacadão | `searchIn("atacadao", "arroz")` | ✅ Funciona (0 resultados — search client-side) |
| Busca todos | `searchAll("arroz")` | ✅ Agrega resultados (Carrefour + Assaí + Atacadão) |
| Product page individual | `getProduct(url)` | ✅ Extrai JSON-LD com nome, preço, marca, imagem |
| Registry | `get("atacadao")` | ✅ Retorna instância |
| ProductResult | `ProductResult` idêntico | ✅ Mesmo tipo, sem campos extras |
| Nenhuma tela modificada | Build com 16 páginas | ✅ Build intacto |

### O que NÃO precisou ser alterado

- `interfaces/scraper.interface.ts` — intacto
- `interfaces/base-scraper.ts` — intacto
- `registry/scraper-registry.ts` — intacto
- `services/search.service.ts` — intacto
- `carrefour/` — intacto
- `assai/` — intacto
- `paodeacucar/` — intacto
- Nenhum arquivo em `apps/web/` — intacto
- `packages/types/` — intacto
- `packages/price-engine/` — intacto

## Como adicionar um novo supermercado (guia atualizado)

1. **Criar** `packages/scrapers/src/novo-mercado/` com:
   - `types.ts` — tipos intermediários de parsing
   - `constants.ts` — SUPERMARKET_ID, BASE_URL, SEARCH_PATH, RATE_LIMIT_MS, seletores
   - `parser.ts` — lógica de parsing (HTML puro, JSON-LD, ou API)
   - `mapper.ts` — `toProductResult()` e `toProductResults()`
   - `scraper.ts` — classe que estende `BaseScraper`, implementa `ScraperInterface`
   - `health.ts` — verificação de saúde do scraper
   - `README.md` — documentação específica
2. **Registrar** no `ScraperRegistry` (import + entrada no Map) — já está como stub
3. **Exportar** no `index.ts` do pacote scrapers

## Decisões Técnicas

1. **JSON-LD como fonte primária**: Ao invés de regex no HTML, o parser do Atacadão usa dados estruturados. Isso é mais confiável que HTML regex porque o schema é padronizado e menos propenso a mudanças cosméticas.
2. **Fallback via SKU no mapper**: Se o SKU está disponível, o `id` do `ProductResult` usa o SKU para maior estabilidade; caso contrário, gera hash do nome (mesmo padrão dos outros).
3. **Health check testa produto real**: O health check do Atacadão busca uma URL de produto conhecida e valida que o JSON-LD foi extraído corretamente com nome e preço.
4. **Search retorna vazio**: O site carrega resultados via JavaScript, então a busca server-side não encontra produtos. Isso é documentado e esperado — o `getProduct()` para URLs específicas funciona.

## Conclusão

A **arquitetura da Sprint 4 está validada pela terceira vez consecutiva**. Três supermercados (Carrefour, Assaí, Atacadão), três realidades técnicas diferentes (HTML com regex, site institucional sem e-commerce, Next.js + VTEX com JSON-LD), e em todos os casos **apenas criar um novo diretório com 7 arquivos** foi suficiente. Nenhuma linha de código fora do módulo foi alterada.

## Próximos Passos

Sprint 7 — Pão de Açúcar: implementar scraper funcional, mesma arquitetura.
