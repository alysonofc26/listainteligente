# Assaí Scraper

## Como funciona

O scraper do Assaí segue o mesmo padrão dos demais supermercados:
- `constants.ts` — URL base, path de busca e seletores regex
- `parser.ts` — extrai dados do HTML retornado pelo site
- `mapper.ts` — converte dados específicos → `ProductResult` padronizado
- `scraper.ts` — orquestra fetch → parse → map
- `health.ts` — monitora se o scraper continua funcional

## Fluxo interno

```
AssaiScraper.search("arroz")
  → fetch(assai.com.br/busca?q=arroz)
  → AssaiParser.parseSearchResults(html)
  → AssaiMapper.toProductResults(parsed)
  → SearchResult com ProductResult[]
```

## Seletores utilizados

Os seletores estão definidos em `constants.ts` como regex. Os principais são:

| Seletor | Alvo |
|---------|------|
| `PRODUCT_ITEM` | Container de cada produto na listagem |
| `PRODUCT_NAME` | Nome do produto (`h2.node-title a`) |
| `PRODUCT_IMAGE` | URL da imagem |
| `PRODUCT_LINK` | URL da página do produto |
| `PRODUCT_BRAND` | Marca do produto |
| `PRODUCT_PRICE` | Preço no formato `R$ XX,XX` |
| `PRODUCT_PRICE_UNIT` | Preço por unidade (ex: `R$ 5,00 / kg`) |
| `OUT_OF_STOCK` | Indicadores de indisponibilidade |

## Possíveis limitações

1. **Site institucional:** O site assai.com.br é institucional (Drupal), sem e-commerce próprio. As categorias e produtos listados são informativos.
2. **Preços podem não estar disponíveis:** Como o Assaí não vende diretamente pelo site, preços podem estar ausentes ou desatualizados.
3. **Busca:** O endpoint `/busca` pode não retornar produtos — depende da configuração do Drupal.
4. **E-commerce via parceiros:** O Assaí vende atualmente via Rappi, Uber e Mercado Livre (a partir de 2026).

## Como atualizar caso o site seja alterado

1. **Acessar** `https://www.assai.com.br/`
2. **Inspecionar** a estrutura HTML dos produtos/categorias
3. **Atualizar** os regex em `constants.ts` se os seletores mudaram
4. **Atualizar** `parser.ts` se a estrutura do HTML mudou significativamente
5. **Testar** com `search("arroz")` e verificar o retorno

Se o Assaí lançar um e-commerce próprio:
1. Atualizar `BASE_URL` e `SEARCH_PATH` em `constants.ts`
2. Reescrever `parser.ts` para a nova estrutura
3. Atualizar `health.ts` com os novos endpoints
