# Atacadão Scraper

## Como funciona

O scraper do Atacadão segue o mesmo padrão dos demais supermercados. Como o site é construído com Next.js + VTEX (Carrefour Group), a abordagem de parsing é diferente:

- **Product pages** (`/product-name-sku-gtin/p`): São renderizadas no servidor (SSR) e contêm dados estruturados JSON-LD com Schema.org Product — nome, marca, preço, imagem, SKU e disponibilidade.
- **Search/Category pages**: São renderizadas no cliente — o servidor retorna apenas o shell HTML, sem produtos. A busca é carregada via API JavaScript.

## Fluxo interno

```
AtacadaoScraper.search("arroz")
  → fetch(atacadao.com.br/busca?q=arroz)
  → Página shell (sem produtos) → retorna 0 resultados

AtacadaoScraper.getProduct(url)
  → fetch(product-page-url)
  → AtacadaoParser.parseProductPage(html)
    → Extrai JSON-LD (Schema.org Product)
    → Extrai BreadcrumbList (categoria)
  → AtacadaoMapper.toProductResult(parsed)
  → ProductResult
```

## Seletores utilizados

Os seletores estão definidos em `constants.ts`. Diferente dos outros supermercados, o Atacadão utiliza **JSON-LD estruturado** dentro de `<script type="application/ld+json">`, não HTML visível.

| Seletor | Alvo |
|---------|------|
| `JSON_LD_PRODUCT` | Schema.org Product (nome, marca, preço, imagem, SKU) |
| `JSON_LD_BREADCRUMB` | Schema.org BreadcrumbList (categoria) |
| `OG_TITLE` | Open Graph title (fallback) |
| `OG_IMAGE` | Open Graph image |
| `OUT_OF_STOCK` | Indicadores de indisponibilidade |

## Possíveis limitações

1. **Busca sem resultados**: O site carrega resultados de busca via JavaScript (cliente). O scraper server-side não consegue extrair produtos da página de busca.
2. **JSON-LD pode mudar**: A estrutura dos dados estruturados pode ser alterada pela equipe do Atacadão/VTEX. Monitorar via health check.
3. **Preço no JSON-LD**: O preço extraído do `offers.price` pode diferir do preço exibido na interface (devido a promoções, descontos por região, etc.).
4. **Site do Grupo Carrefour**: O Atacadão pertence ao grupo Carrefour (desde 2007) e compartilha infraestrutura de e-commerce VTEX.

## Como atualizar caso o site seja alterado

1. **Verificar** se a estrutura JSON-LD nas product pages ainda existe
2. **Atualizar** os regex em `constants.ts` se necessário
3. **Atualizar** `parser.ts` se a estrutura do JSON-LD mudou (ex: alteração no schema)
4. **Testar** `getProduct()` com uma URL de produto conhecida
5. **Verificar** health check para confirmar status

Se o site mudar de plataforma (ex: sair da VTEX):
1. Atualizar `constants.ts` com novos seletores
2. Reescrever `parser.ts` para a nova estrutura HTML
3. Atualizar `health.ts` com novos detectores de plataforma
