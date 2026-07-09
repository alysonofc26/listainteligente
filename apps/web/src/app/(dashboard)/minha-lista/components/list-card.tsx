"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteListDialog } from "./delete-list-dialog";
import { EditListDialog } from "./edit-list-dialog";
import { formatDistanceToNow } from "@/lib/utils";

interface ListSummary {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  total_estimated: number | null;
  item_count: number;
}

interface ListCardProps {
  list: ListSummary;
}

export function ListCard({ list }: ListCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <Link
            href={`/minha-lista/${list.id}`}
            className="flex items-center gap-2 font-semibold hover:text-primary"
          >
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{list.name}</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <Link href={`/minha-lista/${list.id}`}>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                <span>
                  {list.item_count}{" "}
                  {list.item_count === 1 ? "item" : "itens"}
                </span>
              </div>
              {list.total_estimated !== null && (
                <span>
                  Total estimado: R$ {list.total_estimated.toFixed(2)}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-muted-foreground">
              Criada{" "}
              {formatDistanceToNow(new Date(list.created_at), {
                locale: "pt-br",
              })}
            </p>
          </CardFooter>
        </Link>
      </Card>

      <EditListDialog
        list={list}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteListDialog
        list={list}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
