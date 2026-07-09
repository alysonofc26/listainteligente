import { createClient } from "@supabase/supabase-js";
import type { Database } from "types";

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL and Anon Key must be defined in environment variables",
    );
  }

  client = createClient<Database>(url, key);
  return client;
}
