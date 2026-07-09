"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ItemRow } from "./item-row";
import { AddItemForm } from "./add-item-form";
import { calculateTotal } from "price-engine";
import { formatCurrency } from "@/lib/utils";

interface ListItem {
  id: string;
  list_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  estimated_price: number | null;
  checked: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
}

interface ListDetailProps {
  list: ShoppingList;
  items: ListItem[];
}

export function ListDetail({ list, items }: ListDetailProps) {
  const totals = useMemo(() => {
    return calculateTotal(
      items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.estimated_price,
      })),
    );
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/minha-lista">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"}
            {checkedCount > 0 && ` · ${checkedCount} concluído${checkedCount > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {totals.itemCount > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total estimado</span>
            <span className="text-2xl font-bold">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          {totals.itemsWithoutPrice > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              * {totals.itemsWithoutPrice} item(ns) sem preço definido
            </p>
          )}
        </div>
      )}

      <AddItemForm listId={list.id} />

      <Separator />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Lista vazia"
          description="Adicione produtos à sua lista usando o formulário acima."
        />
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} listId={list.id} />
          ))}
        </div>
      )}
    </div>
  );
}
