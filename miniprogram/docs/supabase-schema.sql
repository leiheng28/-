-- 数当家 Supabase 表结构（可选云端同步）
-- 在 Supabase SQL Editor 中执行

create table if not exists public.assets (
  id text primary key,
  user_id text not null,
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists assets_user_id_idx on public.assets (user_id);

alter table public.assets enable row level security;

-- MVP：允许 anon 读写（正式环境请改为基于 auth.uid() 的策略）
create policy "allow anon read write"
  on public.assets
  for all
  using (true)
  with check (true);
