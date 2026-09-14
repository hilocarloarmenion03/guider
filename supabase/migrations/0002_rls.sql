-- 0002_rls.sql
-- Row Level Security policies for System Making Guide

alter table projects enable row level security;
alter table actors enable row level security;
alter table nouns enable row level security;
alter table verbs enable row level security;
alter table verb_actors enable row level security;
alter table verb_nouns enable row level security;
alter table wbs_items enable row level security;
alter table use_case_details enable row level security;
alter table diagrams enable row level security;

create policy "own projects" on projects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own actors" on actors
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own nouns" on nouns
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own verbs" on verbs
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own wbs_items" on wbs_items
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

create policy "own verb_nouns" on verb_nouns
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own verb_actors" on verb_actors
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own use_case_details" on use_case_details
  for all using (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from verbs v join projects p on p.id = v.project_id
            where v.id = verb_id and p.user_id = auth.uid())
  );

create policy "own diagrams" on diagrams
  for all using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
