import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ListsOverview } from "./components/lists-overview";

interface ListRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  total_estimated: number | null;
}

export default async function MinhaListaPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: rawLists } = await supabase
    .from("lists")
    .select("id, name, is_active, created_at, total_estimated")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const lists = (rawLists ?? []) as ListRow[];

  const listsWithCounts = await Promise.all(
    lists.map(async (list) => {
      const { count } = await supabase
        .from("list_items")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      return { ...list, item_count: count ?? 0 };
    }),
  );

  return <ListsOverview lists={listsWithCounts} />;
}
