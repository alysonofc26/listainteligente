"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HistoryService } from "history";
import type { HistoryFilter } from "history";

export async function listPurchases(filter: HistoryFilter = {}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new HistoryService(supabase);
  return await service.list(user.id, filter);
}

export async function getPurchaseDetail(receiptId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new HistoryService(supabase);
  return await service.getDetail(user.id, receiptId);
}

export async function deletePurchase(receiptId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new HistoryService(supabase);
  await service.delete(user.id, receiptId);

  revalidatePath("/historico");
}

export async function reopenPurchase(
  receiptId: string,
  listName?: string,
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new HistoryService(supabase);
  const result = await service.reopen(user.id, receiptId, listName);

  revalidatePath("/minha-lista");
  revalidatePath(`/minha-lista/${result.listId}`);

  return result;
}

export async function getPurchaseSupermarkets() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const service = new HistoryService(supabase);
  return await service.getSupermarkets(user.id);
}
