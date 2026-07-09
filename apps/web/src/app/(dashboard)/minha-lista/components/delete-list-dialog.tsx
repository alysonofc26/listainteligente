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
import { Loader2, Trash2 } from "lucide-react";
import { deleteList } from "@/lib/actions/lists";
import { toast } from "@/components/ui/use-toast";

interface DeleteListDialogProps {
  list: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteListDialog({ list, open, onOpenChange }: DeleteListDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);

    try {
      await deleteList(list.id);
      toast({
        title: "Lista excluída",
        description: `"${list.name}" foi removida com sucesso.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Lista</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a lista <strong>"{list.name}"</strong>?
            Esta ação não pode ser desfeita. Todos os itens serão removidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
