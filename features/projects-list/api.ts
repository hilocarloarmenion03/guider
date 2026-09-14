import { createClient } from "@/lib/supabase/client";

export type ProjectRow = {
  id: string;
  title: string;
  idea: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchProjects(): Promise<ProjectRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, idea, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProject(title: string): Promise<ProjectRow> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({ title, user_id: user.id })
    .select("id, title, idea, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
