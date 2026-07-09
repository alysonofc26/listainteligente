"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { addItem } from "@/lib/actions/items";
import { toast } from "@/components/ui/use-toast";

interface AddItemFormProps {
  listId: string;
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("productName", name);
      formData.set("quantity", quantity);
      formData.set("unit", "un");
      formData.set("estimatedPrice", price);
      await addItem(listId, formData);
      toast({ title: "Item adicionado", description: `"${name}" foi adicionado à lista.` });
      setName("");
      setQuantity("1");
      setPrice("");
      router.refresh();
      inputRef.current?.focus();
    } catch (err) {
      toast({
        title: "Erro ao adicionar item",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[200px]">
        <Input
          ref={inputRef}
          placeholder="Nome do produto..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10"
        />
      </div>
      <div className="w-20">
        <Input
          type="number"
          step="0.001"
          min="0.001"
          placeholder="Qtd"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-10"
        />
      </div>
      <div className="w-28">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Preço R$"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-10"
        />
      </div>
      <Button type="submit" disabled={isLoading || !name.trim()} className="h-10">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span className="ml-2 hidden sm:inline">Adicionar</span>
      </Button>
    </form>
  );
}
