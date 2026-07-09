"use client";

import { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListCard } from "./list-card";
import { CreateListDialog } from "./create-list-dialog";
import { EmptyState } from "@/components/shared/empty-state";

interface ListSummary {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  total_estimated: number | null;
  item_count: number;
}

interface ListsOverviewProps {
  lists: ListSummary[];
}

export function ListsOverview({ lists }: ListsOverviewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minha Lista</h1>
          <p className="text-muted-foreground">
            Gerencie suas listas de compras.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Lista
        </Button>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma lista ainda"
          description="Crie sua primeira lista de compras para começar."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Lista
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <CreateListDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
