export const CARREFOUR = {
  SUPERMARKET_ID: "carrefour",
  BASE_URL: "https://www.carrefour.com.br",
  SEARCH_PATH: "/busca",
  RATE_LIMIT_MS: 2000,
} as const;

export const CARREFOUR_SELECTORS = {
  PRODUCT_ARTICLE: /<a[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
  PRODUCT_NAME: /<span[^>]*class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  PRODUCT_BRAND: /<span[^>]*class="[^"]*product-brand[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  PRODUCT_PRICE: /R?\$\s*([\d.,]+)/,
  PRODUCT_UNIT_PRICE: /([\d.,]+)\s*\/\s*(\w+)/,
  PRODUCT_IMAGE: /<img[^>]*src="([^"]+)"[^>]*alt="[^"]*"/i,
  PRODUCT_LINK: /<a[^>]*href="([^"]+)"[^>]*>/i,
  PROMOTION_LABEL: /<span[^>]*class="[^"]*promotion-label[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  OUT_OF_STOCK: /(?:indispon[íi]vel|fora\s*de\s*estoque|esgotado)/i,
} as const;
