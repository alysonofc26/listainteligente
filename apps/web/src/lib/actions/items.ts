"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function addItem(listId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const productName = formData.get("productName") as string;
  const quantity = Number(formData.get("quantity")) || 1;
  const unit = (formData.get("unit") as string) || "un";
  const estimatedPrice = formData.get("estimatedPrice") as string;

  if (!productName?.trim()) throw new Error("Nome do produto é obrigatório");

  const { error } = await supabase.from("list_items").insert({
    list_id: listId,
    product_name: productName.trim(),
    quantity,
    unit,
    estimated_price:
      estimatedPrice && !Number.isNaN(Number(estimatedPrice))
        ? Number(estimatedPrice)
        : null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista/${listId}`);
}

export async function updateItem(itemId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const productName = formData.get("productName") as string;
  const quantity = Number(formData.get("quantity")) || 1;
  const unit = (formData.get("unit") as string) || "un";
  const estimatedPrice = formData.get("estimatedPrice") as string;

  if (!productName?.trim()) throw new Error("Nome do produto é obrigatório");

  const { error } = await supabase
    .from("list_items")
    .update({
      product_name: productName.trim(),
      quantity,
      unit,
      estimated_price:
        estimatedPrice && !Number.isNaN(Number(estimatedPrice))
          ? Number(estimatedPrice)
          : null,
    })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista`);
}

export async function toggleItem(itemId: string, checked: boolean) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("list_items")
    .update({ checked })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista`);
}

export async function deleteItem(itemId: string, listId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("list_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista/${listId}`);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
  listId: string,
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("list_items")
    .update({ quantity })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista/${listId}`);
}
