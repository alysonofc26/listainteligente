export const ASSAI = {
  SUPERMARKET_ID: "assai",
  BASE_URL: "https://www.assai.com.br",
  SEARCH_PATH: "/busca",
  RATE_LIMIT_MS: 2000,
} as const;

export const ASSAI_SELECTORS = {
  PRODUCT_ITEM:
    /<div[^>]*class="[^"]*views-row[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi,
  PRODUCT_NAME:
    /<h2[^>]*class="[^"]*node-title[^"]*"[^>]*><a[^>]*>([\s\S]*?)<\/a>/i,
  PRODUCT_IMAGE: /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i,
  PRODUCT_LINK: /<a[^>]*href="(\/[^"]+)"[^>]*>/i,
  PRODUCT_BRAND:
    /<span[^>]*class="[^"]*field--name-field-marca[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  PRODUCT_PRICE: /R?\$\s*([\d.,]+)/,
  PROMOTION_LABEL: /<div[^>]*class="[^"]*promocao[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  OUT_OF_STOCK:
    /(?:indispon[ií]vel|fora\s*de\s*estoque|esgotado|sob\s*consulta)/i,
  SEARCH_FORM:
    /<form[^>]*class="[^"]*search-form[^"]*"[^>]*>([\s\S]*?)<\/form>/i,
  PRODUCT_PRICE_UNIT: /([\d.,]+)\s*\/\s*(\w+)/,
} as const;

export const ASSAI_CATEGORIES = [
  "acougue",
  "bazar",
  "bebidas",
  "cafeterias",
  "congelados",
  "eletroportateis",
  "higiene-e-perfumaria",
  "hortifruti",
  "laticinios",
  "limpeza",
  "mercearia",
  "padaria",
] as const;

export const ASSAI_CATEGORY_LABELS: Record<string, string> = {
  acougue: "Açougue",
  bazar: "Bazar",
  bebidas: "Bebidas",
  cafeterias: "Cafeterias",
  congelados: "Congelados",
  eletroportateis: "Eletroportáteis",
  "higiene-e-perfumaria": "Higiene e Perfumaria",
  hortifruti: "Hortifrúti",
  laticinios: "Laticínios",
  limpeza: "Limpeza",
  mercearia: "Mercearia",
  padaria: "Padaria",
} as const;
