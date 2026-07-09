import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListDetail } from "./components/list-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: list } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!list) notFound();

  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("created_at", { ascending: true });

  return <ListDetail list={list} items={items ?? []} />;
}
