-- Permite comprobar si un username existe antes del registro (usuario aún no autenticado)
create policy profiles_select_anon on public.profiles
  for select to anon using (true);
