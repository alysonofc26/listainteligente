import { BaseRepository } from "./base";
import type { Tables } from "types";

export class FavoritesRepository extends BaseRepository<"favorites"> {
  protected readonly tableName = "favorites";

  async findByUserId(
    userId: string,
  ): Promise<
    (Tables<"favorites"> & { products: Tables<"products"> | null })[]
  > {
    const { data } = await this.client
      .from("favorites")
      .select("*, products(*)")
      .eq("user_id", userId);

    return (data ?? []) as never;
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const { data } = await this.client
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    return !!data;
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.client
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
  }
}
