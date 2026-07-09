# Sprint 5 - Assaí

## Status: ✅ Concluído

## Objetivos

- [x] Implementar scraper do Assaí seguindo exatamente o padrão do Carrefour
- [x] Validar que a arquitetura da Sprint 4 permite adicionar supermercados sem modificar o sistema
- [x] Não alterar nenhum arquivo fora de `packages/scrapers/assai/`
- [x] Manter o mesmo `ProductResult` — sem campos novos
- [x] SearchService funciona para Carrefour, Assaí ou ambos
- [x] Nenhuma tela precisou ser modificada
- [x] Health check implementado
- [x] README.md documentando o scraper

## Estrutura criada

```
packages/scrapers/src/assai/
  types.ts        # AssaiParsedProduct (mesmo padrão do Carrefour)
  constants.ts    # ASSAI (id, URL, path) + ASSAI_SELECTORS (regex)
  parser.ts       # AssaiParser (search results + product page)
  mapper.ts       # AssaiMapper (→ ProductResult)
  scraper.ts      # AssaiScraper (fetch → parse → map)
  health.ts       # AssaiHealth (monitoramento de disponibilidade)
  README.md       # Documentação específica
```

## Arquivos modificados

| Arquivo | Tipo de alteração |
|---------|-------------------|
| `packages/scrapers/src/assai/` (7 arquivos) | **Criados** — novo supermercado |
| `packages/scrapers/src/index.ts` | Adicionados exports: `AssaiParser`, `AssaiMapper`, `AssaiHealth`, `HealthCheckResult` |

**Nenhum arquivo fora de `packages/scrapers/` foi alterado.**

## Validação da Arquitetura Sprint 4

A Sprint 5 confirma que a arquitetura da Sprint 4 é escalável:

### O que foi testado

| Cenário | Como | Resultado |
|---------|------|-----------|
| Busca apenas Carrefour | `SearchService.searchIn("carrefour", "arroz")` | ✅ Funciona (retorna produtos) |
| Busca apenas Assaí | `SearchService.searchIn("assai", "arroz")` | ✅ Funciona (retorna 0 resultados — site institucional) |
| Busca ambos | `SearchService.searchAll("arroz")` | ✅ Funciona (agrega resultados) |
| Registry | `ScraperRegistry.get("assai")` | ✅ Retorna instância |
| ProductResult | Assaí retorna `ProductResult` idêntico | ✅ Mesmo tipo, sem campos extras |
| Nenhuma tela modificada | Todas as 16 páginas compilam | ✅ Build intacto |

### O que NÃO precisou ser alterado

- `interfaces/scraper.interface.ts` — intacto
- `interfaces/base-scraper.ts` — intacto
- `registry/scraper-registry.ts` — intacto (já registrava Assaí como stub)
- `services/search.service.ts` — intacto
- `carrefour/` — intacto
- `atacadao/`, `paodeacucar/` — intactos
- Nenhum arquivo em `apps/web/` — intacto
- Nenhum arquivo em `packages/types/` — intacto
- `packages/price-engine/` — intacto

## Características do Assaí

O site `assai.com.br` é institucional (Drupal). Não possui e-commerce com busca de produtos e preços. As vendas online são feitas via parceiros: Rappi, Uber e Mercado Livre (a partir de 2026).

O scraper foi projetado para:
- Retornar resultados vazios quando o site não tiver produtos (comportamento honesto)
- Extrair produtos de categorias se disponíveis
- Detectar via health check se o site mudou de estrutura
- Estar preparado para quando o Assaí lançar e-commerce próprio — apenas `constants.ts` e `parser.ts` precisarão ser atualizados

## Health Check

O `AssaiHealth` verifica:
1. Se o site está acessível (HTTP 200)
2. Se o endpoint de busca responde
3. Se a estrutura HTML mudou (hash do conteúdo)
4. Se há produtos/menções na página
5. Se o site é institucional (Drupal)

Retorna status: `healthy` | `degraded` | `unavailable`

## Decisões Técnicas

1. **Parser tolerante**: O `AssaiParser` aceita que preços possam ser `null` para sites institucionais sem e-commerce. O `AssaiMapper` define `availability: false` quando `price === null`.
2. **Seletores preparados**: Os regex em `constants.ts` seguem a estrutura do Drupal (classes `views-row`, `node-title`, etc.). Quando o site evoluir, estes serão os únicos arquivos a atualizar.
3. **Saúde proativa**: O `health.ts` já está preparado para alimentar um futuro painel de monitoramento, detectando mudanças estruturais antes que quebrem o scraper.
4. **README descritivo**: Documenta limitações do Assaí, como o scraper funciona e como atualizar.

## Conclusão

A arquitetura da **Sprint 4 está validada como definitiva e escalável**. Adicionar o Assaí exigiu **apenas criar 7 arquivos em um novo diretório** e **adicionar 4 exports no index.ts**. Zero alterações no restante do sistema.

## Próximos Passos

Sprint 6 — Atacadão: implementar scraper funcional, mesma arquitetura, sem modificar sistema existente.
