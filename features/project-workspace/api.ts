import { createClient } from "@/lib/supabase/client";

// ─── Project ───────────────────────────────────────────────────
export type Project = {
  id: string;
  title: string;
  idea: string | null;
  scope_in: string | null;
  scope_out: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchProject(id: string): Promise<Project> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  fields: Partial<Pick<Project, "title" | "idea" | "scope_in" | "scope_out">>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").update(fields).eq("id", id);
  if (error) throw error;
}

// ─── Actors ────────────────────────────────────────────────────
export type Actor = { id: string; name: string };

export async function fetchActors(projectId: string): Promise<Actor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("actors")
    .select("id, name")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function insertActor(
  projectId: string,
  name: string
): Promise<Actor> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("actors")
    .insert({ project_id: projectId, name })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function removeActor(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("actors").delete().eq("id", id);
  if (error) throw error;
}

// ─── Nouns ─────────────────────────────────────────────────────
export type Noun = { id: string; name: string };

export async function fetchNouns(projectId: string): Promise<Noun[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nouns")
    .select("id, name")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function insertNoun(
  projectId: string,
  name: string
): Promise<Noun> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nouns")
    .insert({ project_id: projectId, name })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function removeNoun(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("nouns").delete().eq("id", id);
  if (error) throw error;
}

// ─── Verbs + links ─────────────────────────────────────────────
export type VerbRow = {
  id: string;
  name: string;
  actorIds: string[];
  actorNames: string[];
  nounIds: string[];
  nounNames: string[];
};

export async function fetchVerbs(projectId: string): Promise<VerbRow[]> {
  const supabase = createClient();
  const { data: verbs, error } = await supabase
    .from("verbs")
    .select(
      `id, name,
       verb_actors ( actor_id, actors:actor_id ( id, name ) ),
       verb_nouns  ( noun_id,  nouns:noun_id  ( id, name ) )`
    )
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;

  return (verbs ?? []).map((v: any) => ({
    id: v.id,
    name: v.name,
    actorIds: (v.verb_actors ?? []).map((va: any) => va.actors.id),
    actorNames: (v.verb_actors ?? []).map((va: any) => va.actors.name),
    nounIds: (v.verb_nouns ?? []).map((vn: any) => vn.nouns.id),
    nounNames: (v.verb_nouns ?? []).map((vn: any) => vn.nouns.name),
  }));
}

export async function insertVerb(
  projectId: string,
  payload: { name: string; actorIds: string[]; nounIds: string[] }
): Promise<void> {
  const supabase = createClient();
  // Insert verb
  const { data: verb, error: verbErr } = await supabase
    .from("verbs")
    .insert({ project_id: projectId, name: payload.name })
    .select("id")
    .single();
  if (verbErr) throw verbErr;

  // Insert verb_actors
  const actorRows = payload.actorIds.map((actor_id) => ({
    verb_id: verb.id,
    actor_id,
  }));
  if (actorRows.length > 0) {
    const { error } = await supabase.from("verb_actors").insert(actorRows);
    if (error) throw error;
  }

  // Insert verb_nouns
  const nounRows = payload.nounIds.map((noun_id) => ({
    verb_id: verb.id,
    noun_id,
  }));
  if (nounRows.length > 0) {
    const { error } = await supabase.from("verb_nouns").insert(nounRows);
    if (error) throw error;
  }
}

export async function removeVerb(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("verbs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Use Case Details ──────────────────────────────────────────
export type UseCaseDetail = {
  id: string;
  verb_id: string;
  uc_number: number;
  priority: string | null;
  description: string | null;
  trigger: string | null;
  type: string | null;
  preconditions: string | null;
  normal_course: string | null;
  alternative_courses: string | null;
  postconditions: string | null;
  exceptions: string | null;
};

export async function fetchUseCaseDetails(
  projectId: string
): Promise<UseCaseDetail[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("use_case_details")
    .select(
      `id, verb_id, uc_number, priority, description, trigger, type,
       preconditions, normal_course, alternative_courses, postconditions, exceptions,
       verbs!inner ( project_id )`
    )
    .eq("verbs.project_id", projectId)
    .order("uc_number");
  if (error) throw error;
  return (data ?? []).map((d: any) => {
    const { verbs, ...rest } = d;
    return rest;
  });
}

export async function updateUseCaseDetail(
  id: string,
  fields: Partial<
    Omit<UseCaseDetail, "id" | "verb_id" | "uc_number">
  >
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("use_case_details")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
}

// ─── WBS Items ─────────────────────────────────────────────────
export type WbsItem = {
  id: string;
  name: string;
  parent_id: string | null;
};

export async function fetchWbsItems(projectId: string): Promise<WbsItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wbs_items")
    .select("id, name, parent_id")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function insertWbsItem(
  projectId: string,
  name: string,
  parentId: string | null = null
): Promise<WbsItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wbs_items")
    .insert({ project_id: projectId, name, parent_id: parentId })
    .select("id, name, parent_id")
    .single();
  if (error) throw error;
  return data;
}

export async function removeWbsItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("wbs_items").delete().eq("id", id);
  if (error) throw error;
}

// ─── Diagrams (draw.io XML persistence) ────────────────────────
export type DiagramType = "erd" | "dfd" | "use_case";
export type DiagramRow = {
  id: string;
  diagram_type: DiagramType;
  xml: string | null;
};

export async function fetchDiagram(
  projectId: string,
  diagramType: DiagramType
): Promise<DiagramRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("diagrams")
    .select("id, diagram_type, xml")
    .eq("project_id", projectId)
    .eq("diagram_type", diagramType)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDiagram(
  projectId: string,
  diagramType: DiagramType,
  xml: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("diagrams").upsert(
    { project_id: projectId, diagram_type: diagramType, xml },
    { onConflict: "project_id,diagram_type" }
  );
  if (error) throw error;
}

// ─── Seed WBS from Scope In ────────────────────────────────────
export async function seedWbsFromScope(
  projectId: string,
  scopeIn: string
): Promise<WbsItem[]> {
  const lines = scopeIn
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const items: WbsItem[] = [];
  for (const line of lines) {
    const item = await insertWbsItem(projectId, line, null);
    items.push(item);
  }
  return items;
}
