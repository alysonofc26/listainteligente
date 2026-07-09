import { BaseRepository } from "./base";
import type { Tables } from "types";

export class SupermarketsRepository extends BaseRepository<"supermarkets"> {
  protected readonly tableName = "supermarkets";

  async findBySlug(slug: string): Promise<Tables<"supermarkets"> | null> {
    const { data } = await this.client
      .from("supermarkets")
      .select("*")
      .eq("slug", slug)
      .single();

    return data;
  }

  async findActive(): Promise<Tables<"supermarkets">[]> {
    const { data } = await this.client
      .from("supermarkets")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    return data ?? [];
  }
}
