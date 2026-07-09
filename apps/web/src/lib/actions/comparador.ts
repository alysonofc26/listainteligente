"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ComparisonService } from "@/lib/services/comparison-service";
import { AiService } from "ai";
import type { ComparisonSummary } from "price-engine";
import type { AiContext } from "ai";

export interface SummaryAiResult {
  comparison: ComparisonSummary;
  aiRecommendation: string | null;
}

export async function compareFullList(listId?: string): Promise<SummaryAiResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  let targetListId = listId;

  if (!targetListId) {
    const { data: activeList } = await supabase
      .from("lists")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!activeList) {
      throw new Error("Nenhuma lista ativa encontrada. Crie uma lista primeiro.");
    }

    targetListId = activeList.id;
  }

  const { data: listItems } = await supabase
    .from("list_items")
    .select("product_name, quantity, unit, estimated_price")
    .eq("list_id", targetListId);

  if (!listItems || listItems.length === 0) {
    throw new Error("A lista está vazia. Adicione produtos primeiro.");
  }

  const service = new ComparisonService();
  const comparison = await service.compareList(
    listItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unit: item.unit,
      estimatedPrice: item.estimated_price,
    })),
  );

  let aiRecommendation: string | null = null;

  try {
    const aiService = new AiService();
    const context = buildAiContext(listItems, comparison);
    const response = await aiService.analyze(context);
    aiRecommendation = response.content;
  } catch {
    aiRecommendation = null;
  }

  return { comparison, aiRecommendation };
}

export async function compareSingleProduct(
  productName: string,
  quantity: number = 1,
  unit: string = "un",
): Promise<SummaryAiResult> {
  const service = new ComparisonService();
  const comparison = await service.compareProduct(productName, quantity, unit);

  let aiRecommendation: string | null = null;

  try {
    const aiService = new AiService();
    const context: AiContext = {
      action: "savings",
      listName: `Comparação: ${productName}`,
      items: comparison.items.map((item) => ({
        name: `${item.productName} (menor preço: ${item.lowestSupermarketName})`,
        quantity: item.quantity,
        price: item.lowestPrice > 0 ? item.lowestPrice : null,
        unitPrice: null,
        category: null,
        brand: null,
      })),
      total: comparison.totalLowest,
      itemCount: comparison.items.length,
    };
    const response = await aiService.analyze(context);
    aiRecommendation = response.content;
  } catch {
    aiRecommendation = null;
  }

  return { comparison, aiRecommendation };
}

function buildAiContext(
  listItems: Array<{ product_name: string; quantity: number; unit: string; estimated_price: number | null }>,
  comparison: ComparisonSummary,
): AiContext {
  return {
    action: "savings",
    listName: "Comparador Inteligente",
    items: listItems.map((item, index) => {
      const comp = comparison.items[index];
      return {
        name: comp && comp.lowestPrice > 0
          ? `${item.product_name} (melhor: ${comp.lowestSupermarketName} por R$ ${comp.lowestPrice.toFixed(2)})`
          : item.product_name,
        quantity: item.quantity,
        price: comp?.lowestPrice ?? item.estimated_price,
        unitPrice: null,
        category: null,
        brand: null,
      };
    }),
    total: comparison.totalLowest,
    itemCount: comparison.items.length,
  };
}
