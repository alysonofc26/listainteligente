import { BaseRepository } from "./base";
import type { Tables } from "types";

export class ListsRepository extends BaseRepository<"lists"> {
  protected readonly tableName = "lists";

  async findByUserId(userId: string): Promise<Tables<"lists">[]> {
    const { data } = await this.client
      .from("lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return data ?? [];
  }

  async findActiveByUserId(userId: string): Promise<Tables<"lists">[]> {
    const { data } = await this.client
      .from("lists")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return data ?? [];
  }

  async getListItems(listId: string): Promise<Tables<"list_items">[]> {
    const { data } = await this.client
      .from("list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });

    return data ?? [];
  }

  async addItem(
    item: Tables<"list_items">,
  ): Promise<Tables<"list_items">> {
    const { data } = await this.client
      .from("list_items")
      .insert(item)
      .select()
      .single();

    if (!data) throw new Error("Failed to add item to list");
    return data;
  }

  async updateItem(
    itemId: string,
    updates: Partial<Tables<"list_items">>,
  ): Promise<void> {
    await this.client
      .from("list_items")
      .update(updates)
      .eq("id", itemId);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.client
      .from("list_items")
      .delete()
      .eq("id", itemId);
  }

  async toggleItemCheck(itemId: string, checked: boolean): Promise<void> {
    await this.client
      .from("list_items")
      .update({ checked })
      .eq("id", itemId);
  }
}
