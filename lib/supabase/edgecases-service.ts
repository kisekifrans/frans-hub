import type { SupabaseClient } from "@supabase/supabase-js";
import type { EdgeCase, EdgeCaseInput } from "@/lib/edgecases/types";
import type { DbEdgeCase } from "./database.types";
import { edgeCaseFromDb, edgeCaseToDb } from "./edgecases-mappers";
import { removeEdgeCaseStorage } from "./edgecases-storage";

export async function fetchEdgeCases(
  supabase: SupabaseClient,
): Promise<EdgeCase[]> {
  const { data, error } = await supabase
    .from("edge_cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbEdgeCase[]).map(edgeCaseFromDb);
}

export async function createEdgeCase(
  supabase: SupabaseClient,
  input: EdgeCaseInput,
  presetId?: string,
): Promise<EdgeCase> {
  const id = presetId?.trim() || crypto.randomUUID();
  const row = {
    ...edgeCaseToDb({ ...input, id, isFavorite: input.isFavorite ?? false }),
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("edge_cases")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return edgeCaseFromDb(data as DbEdgeCase);
}

export async function updateEdgeCase(
  supabase: SupabaseClient,
  item: EdgeCase,
): Promise<EdgeCase> {
  const row = edgeCaseToDb(item);
  const { data, error } = await supabase
    .from("edge_cases")
    .update(row)
    .eq("id", item.id)
    .select()
    .single();
  if (error) throw error;
  return edgeCaseFromDb(data as DbEdgeCase);
}

export async function deleteEdgeCase(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  await removeEdgeCaseStorage(supabase, id).catch(() => {
    /* storage may already be empty */
  });
  const { error } = await supabase.from("edge_cases").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleEdgeCaseFavorite(
  supabase: SupabaseClient,
  item: EdgeCase,
): Promise<EdgeCase> {
  return updateEdgeCase(supabase, {
    ...item,
    isFavorite: !item.isFavorite,
  });
}
