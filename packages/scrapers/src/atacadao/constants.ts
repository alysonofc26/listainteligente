export const ATACADAO = {
  SUPERMARKET_ID: "atacadao",
  BASE_URL: "https://www.atacadao.com.br",
  SEARCH_PATH: "/busca",
  RATE_LIMIT_MS: 2000,
} as const;

export const ATACADAO_SELECTORS = {
  JSON_LD_PRODUCT: /<script[^>]*type="application\/ld\+json"[^>]*>({[\s\S]*?"@type"\s*:\s*"Product"[\s\S]*?})<\/script>/i,
  JSON_LD_BREADCRUMB:
    /<script[^>]*type="application\/ld\+json"[^>]*>({[\s\S]*?"@type"\s*:\s*"BreadcrumbList"[\s\S]*?})<\/script>/i,
  OG_TITLE: /<meta[^>]*property="og:title"[^>]*content="([^"]+)"[^>]*\/?>/i,
  OG_IMAGE: /<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*\/?>/i,
  PRODUCT_NAME:
    /<meta[^>]*property="product:price:amount"[^>]*content="([^"]+)"[^>]*\/?>/i,
  PRODUCT_CURRENCY:
    /<meta[^>]*property="product:price:currency"[^>]*content="([^"]+)"[^>]*\/?>/i,
  TITLE: /<title[^>]*>([\s\S]*?)<\/title>/i,
  META_DESCRIPTION:
    /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*\/?>/i,
  OUT_OF_STOCK:
    /(?:indispon[ií]vel|fora\s*de\s*estoque|esgotado|sem\s*estoque)/i,
  VTEX_ACCOUNT: /atacadaobr/,
} as const;

export const ATACADAO_SITEMAP_PRODUCT_PATTERN =
  "https://www.atacadao.com.br/sitemap/product-{index}.xml";

export const ATACADAO_SITEMAP_COUNT = 56 as const;
