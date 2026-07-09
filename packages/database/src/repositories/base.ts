import { getSupabaseClient } from "../client";
import type { Database } from "types";

type TableName = keyof Database["public"]["Tables"];

type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];

type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export abstract class BaseRepository<T extends TableName> {
  protected abstract readonly tableName: T;

  protected get client() {
    return getSupabaseClient();
  }

  async findById(id: string): Promise<Row<T> | null> {
    const { data } = await this.client
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    return data;
  }

  async findMany(options?: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  }): Promise<Row<T>[]> {
    let query = this.client
      .from(this.tableName)
      .select("*");

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 20) - 1,
      );
    }

    const { data } = await query;
    return data ?? [];
  }

  async create(input: Insert<T>): Promise<Row<T>> {
    const { data } = await this.client
      .from(this.tableName)
      .insert(input)
      .select()
      .single();

    if (!data) {
      throw new Error(`Failed to create record in ${this.tableName}`);
    }

    return data;
  }

  async update(id: string, input: Update<T>): Promise<Row<T> | null> {
    const { data } = await this.client
      .from(this.tableName)
      .update(input)
      .eq("id", id)
      .select()
      .single();

    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq("id", id);

    return !error;
  }

  async count(): Promise<number> {
    const { count } = await this.client
      .from(this.tableName)
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  }
}
