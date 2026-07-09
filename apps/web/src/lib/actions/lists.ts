"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createList(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Nome da lista é obrigatório");

  const { error } = await supabase.from("lists").insert({
    user_id: user.id,
    name: name.trim(),
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/minha-lista");
}

export async function updateList(listId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Nome da lista é obrigatório");

  const { error } = await supabase
    .from("lists")
    .update({ name: name.trim() })
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/minha-lista");
  revalidatePath(`/minha-lista/${listId}`);
}

export async function deleteList(listId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/minha-lista");
}
