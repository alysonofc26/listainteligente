import { SearchService } from "scrapers";
import { consolidateComparison } from "price-engine";
import type { ComparisonSummary } from "price-engine";

interface ListItemData {
  productName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
}

export class ComparisonService {
  async compareList(
    items: ListItemData[],
  ): Promise<ComparisonSummary> {
    const searchService = new SearchService();

    const inputItems = await Promise.all(
      items.map(async (item) => {
        const result = await searchService.searchAll(item.productName);

        const supermarketPrices = Object.entries(result.bySupermarket).map(
          ([slug, data]) => {
            const bestProduct = data.products[0];
            return {
              supermarketId: slug,
              supermarketName: this.getSupermarketName(slug),
              price: bestProduct?.price ?? 0,
              unitPrice: bestProduct?.unitPrice ?? null,
              url: bestProduct?.url ?? null,
              image: bestProduct?.image ?? null,
            };
          },
        ).filter((p) => p.price > 0);

        return {
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          estimatedPrice: item.estimatedPrice,
          supermarketPrices,
        };
      }),
    );

    return consolidateComparison(inputItems);
  }

  async compareProduct(
    productName: string,
    quantity: number = 1,
    unit: string = "un",
  ): Promise<ComparisonSummary> {
    return this.compareList([{ productName, quantity, unit, estimatedPrice: null }]);
  }

  private getSupermarketName(slug: string): string {
    const names: Record<string, string> = {
      carrefour: "Carrefour",
      assai: "Assaí",
      atacadao: "Atacadão",
      paodeacucar: "Pão de Açúcar",
    };
    return names[slug] ?? slug;
  }
}
