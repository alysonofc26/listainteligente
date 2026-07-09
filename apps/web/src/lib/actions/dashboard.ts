"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatisticsService } from "statistics";

export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new StatisticsService(supabase);
  return await service.getDashboardStats(user.id);
}

export async function getProviderData() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const service = new StatisticsService(supabase);
  return await service.getProviderData(user.id);
}
