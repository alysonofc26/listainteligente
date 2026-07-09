import type { PriceEngineItem, PriceEngineTotals } from "./types";

export function calculateTotal(items: PriceEngineItem[]): PriceEngineTotals {
  if (items.length === 0) {
    return {
      subtotal: 0,
      itemCount: 0,
      itemsWithPrice: 0,
      itemsWithoutPrice: 0,
      averagePrice: null,
    };
  }

  let subtotal = 0;
  let itemsWithPrice = 0;
  let itemsWithoutPrice = 0;

  for (const item of items) {
    if (item.unitPrice !== null && item.unitPrice >= 0) {
      subtotal += item.quantity * item.unitPrice;
      itemsWithPrice++;
    } else {
      itemsWithoutPrice++;
    }
  }

  const averagePrice =
    itemsWithPrice > 0
      ? Math.round((subtotal / itemsWithPrice) * 100) / 100
      : null;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: items.length,
    itemsWithPrice,
    itemsWithoutPrice,
    averagePrice,
  };
}
