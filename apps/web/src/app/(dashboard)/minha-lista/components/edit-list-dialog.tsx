"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateList } from "@/lib/actions/lists";
import { toast } from "@/components/ui/use-toast";

interface EditListDialogProps {
  list: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditListDialog({ list, open, onOpenChange }: EditListDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(list.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Digite um nome para a lista");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      await updateList(list.id, formData);
      toast({ title: "Lista renomeada", description: "O nome foi atualizado com sucesso." });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao renomear lista");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Renomear Lista</DialogTitle>
            <DialogDescription>
              Altere o nome da sua lista de compras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome da lista</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Compras do mês"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
