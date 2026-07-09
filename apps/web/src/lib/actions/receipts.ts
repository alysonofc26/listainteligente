"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PurchaseResult } from "ocr";

export async function saveReceipt(
  result: PurchaseResult,
  imageData: string | null,
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  let supermarketId: string | null = null;

  if (result.metadata.supermarketName) {
    const name = result.metadata.supermarketName.toLowerCase();
    const { data: supermarket } = await supabase
      .from("supermarkets")
      .select("id")
      .ilike("name", `%${name}%`)
      .maybeSingle();

    if (supermarket) {
      supermarketId = supermarket.id;
    }
  }

  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .insert({
      user_id: user.id,
      supermarket_id: supermarketId,
      total_amount: result.metadata.totalAmount,
      tax_amount: result.metadata.taxAmount,
      receipt_date: result.metadata.date ?? new Date().toISOString(),
      receipt_image_url: imageData,
      ocr_raw_text: result.metadata.rawText,
    })
    .select("id")
    .single();

  if (receiptError) throw new Error(receiptError.message);

  if (result.items.length > 0) {
    const receiptItems = result.items.map((item) => ({
      receipt_id: receipt.id,
      product_name: item.normalizedName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      category: item.category,
    }));

    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(receiptItems);

    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/historico");

  return receipt.id;
}

export async function importReceiptItems(
  receiptId: string,
  listId: string,
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: receiptItems } = await supabase
    .from("receipt_items")
    .select("product_name, quantity, unit_price, category")
    .eq("receipt_id", receiptId);

  if (!receiptItems || receiptItems.length === 0) {
    throw new Error("Nenhum item encontrado no cupom.");
  }

  const listItems = receiptItems.map((item) => ({
    list_id: listId,
    product_name: item.product_name,
    quantity: item.quantity,
    unit: "un",
    estimated_price: item.unit_price,
    notes: item.category ? `Categoria: ${item.category}` : null,
  }));

  const { error } = await supabase.from("list_items").insert(listItems);

  if (error) throw new Error(error.message);

  revalidatePath(`/minha-lista/${listId}`);
}

export async function getReceiptLists() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("lists")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}
