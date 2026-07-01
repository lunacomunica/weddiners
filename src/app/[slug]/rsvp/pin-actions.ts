"use server";

import { createClient } from "@/lib/supabase/server";

export type LookupResult =
  | { type: "guest"; guestId: string; name: string }
  | { type: "group"; token: string; name: string }
  | { type: "multiple"; matches: { id: string; name: string; groupToken: string | null }[] }
  | { error: string };

export async function lookupByName(slug: string, search: string): Promise<LookupResult> {
  const supabase = createClient();

  const { data: couple } = await supabase.from("couples").select("id").eq("slug", slug).single();
  if (!couple) return { error: "not_found" };

  const normalized = search.trim().toLowerCase();
  if (normalized.length < 2) return { error: "too_short" };

  // Busca convidados com nome parecido (ilike)
  const { data: guests } = await supabase
    .from("guests")
    .select("id, name, group_id")
    .eq("couple_id", couple.id)
    .ilike("name", `%${normalized}%`)
    .limit(10);

  if (!guests || guests.length === 0) return { error: "not_found" };

  // Resultado único → vai direto
  if (guests.length === 1) {
    const guest = guests[0];
    // Se tem grupo, redireciona para o grupo
    if (guest.group_id) {
      const { data: group } = await supabase
        .from("guest_groups")
        .select("token")
        .eq("id", guest.group_id)
        .single();
      if (group) return { type: "group", token: group.token, name: guest.name };
    }
    return { type: "guest", guestId: guest.id, name: guest.name };
  }

  // Múltiplos resultados → mostra lista para escolher
  const groupIds = guests.map(g => g.group_id).filter(Boolean) as string[];
  const groupTokenMap: Record<string, string> = {};

  if (groupIds.length > 0) {
    const { data: groups } = await supabase
      .from("guest_groups")
      .select("id, token")
      .in("id", groupIds);
    groups?.forEach(g => { groupTokenMap[g.id] = g.token; });
  }

  return {
    type: "multiple",
    matches: guests.map(g => ({
      id: g.id,
      name: g.name,
      groupToken: g.group_id ? (groupTokenMap[g.group_id] ?? null) : null,
    })),
  };
}

// Mantido por compatibilidade (não mais usado na UI)
export async function lookupPin(slug: string, pin: string): Promise<LookupResult> {
  return lookupByName(slug, pin);
}
