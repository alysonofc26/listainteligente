import { BaseRepository } from "./base";
import type { Tables } from "types";

export class ProductsRepository extends BaseRepository<"products"> {
  protected readonly tableName = "products";

  async search(query: string): Promise<Tables<"products">[]> {
    const { data } = await this.client
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true })
      .limit(20);

    return data ?? [];
  }

  async findByBarcode(barcode: string): Promise<Tables<"products"> | null> {
    const { data } = await this.client
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    return data;
  }

  async findByCategory(category: string): Promise<Tables<"products">[]> {
    const { data } = await this.client
      .from("products")
      .select("*")
      .eq("category", category)
      .order("name", { ascending: true });

    return data ?? [];
  }

  async upsert(
    product: Partial<Tables<"products">>,
  ): Promise<Tables<"products">> {
    const { data } = await this.client
      .from("products")
      .upsert(product, { onConflict: "barcode" })
      .select()
      .single();

    if (!data) throw new Error("Failed to upsert product");
    return data;
  }
}
