"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { toggleItem, deleteItem, updateItem } from "@/lib/actions/items";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { calculateTotal } from "price-engine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Item {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  estimated_price: number | null;
  checked: boolean;
}

interface ItemRowProps {
  item: Item;
  listId: string;
}

export function ItemRow({ item, listId }: ItemRowProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleToggle() {
    await toggleItem(item.id, !item.checked);
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteItem(item.id, listId);
      toast({ title: "Item removido" });
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast({
        title: "Erro ao remover item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const itemTotal =
    item.estimated_price !== null
      ? calculateTotal([
          { quantity: item.quantity, unitPrice: item.estimated_price },
        ])
      : null;

  return (
    <>
      <div
        className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors ${
          item.checked ? "opacity-60" : ""
        }`}
      >
        <Checkbox
          checked={item.checked}
          onCheckedChange={handleToggle}
          aria-label={`Marcar ${item.product_name} como concluído`}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              item.checked ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.product_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.quantity} {item.unit}
            {item.estimated_price !== null &&
              ` · ${formatCurrency(item.estimated_price)}/${item.unit}`}
          </p>
        </div>
        <div className="text-right">
          {itemTotal && (
            <p className="text-sm font-medium">
              {formatCurrency(itemTotal.subtotal)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <EditItemDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>"{item.product_name}"</strong> da lista?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditItemDialog({
  item,
  open,
  onOpenChange,
}: {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(item.product_name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit);
  const [price, setPrice] = useState(
    item.estimated_price !== null ? String(item.estimated_price) : "",
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("productName", name);
      formData.set("quantity", quantity);
      formData.set("unit", unit);
      formData.set("estimatedPrice", price);
      await updateItem(item.id, formData);
      toast({ title: "Item atualizado" });
      onOpenChange(false);
      router.refresh();
    } catch {
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Altere os dados do produto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Produto</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-qty">Quantidade</Label>
                <Input
                  id="item-qty"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-unit">Unidade</Label>
                <Input
                  id="item-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Preço estimado (R$)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
