import { BaseRepository } from "./base";
import type { Tables } from "types";

export class PricesRepository extends BaseRepository<"product_prices"> {
  protected readonly tableName = "product_prices";

  async findByProductAndSupermarket(
    productId: string,
    supermarketId: string,
  ): Promise<Tables<"product_prices"> | null> {
    const { data } = await this.client
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .eq("supermarket_id", supermarketId)
      .single();

    return data;
  }

  async findLowestPrice(
    productId: string,
  ): Promise<Tables<"product_prices"> | null> {
    const { data } = await this.client
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .order("price", { ascending: true })
      .limit(1)
      .single();

    return data;
  }

  async getPriceHistory(
    productId: string,
    supermarketId: string,
    days = 30,
  ): Promise<Tables<"price_history">[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await this.client
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .eq("supermarket_id", supermarketId)
      .gte("recorded_at", since.toISOString())
      .order("recorded_at", { ascending: true });

    return data ?? [];
  }
}
