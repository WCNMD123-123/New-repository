-- =========================================================
-- 点亮星空 V4 - Supabase 数据库初始化
-- 用法：Supabase -> SQL Editor -> New query -> 粘贴全部 -> Run
-- =========================================================

create table if not exists public.activity (
  id bigint primary key,
  stars bigint not null default 0,
  target bigint not null default 500
);

insert into public.activity (id, stars, target)
values (1, 0, 500)
on conflict (id) do nothing;

alter table public.activity enable row level security;

-- 清理旧策略，避免重复执行时报错
drop policy if exists public_read_activity on public.activity;
drop policy if exists admin_update_activity on public.activity;

-- 主页面需要能够读取活动数据
create policy public_read_activity
on public.activity
for select
to anon, authenticated
using (id = 1);

-- 后台登录后允许修改活动数据
create policy admin_update_activity
on public.activity
for update
to authenticated
using (id = 1)
with check (id = 1);

-- 获取当前星星数量
create or replace function public.get_activity()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'stars', stars,
    'target', target
  )
  from public.activity
  where id = 1;
$$;

-- 每打开一次活动页面，星星 +1
create or replace function public.increment_stars()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.activity;
begin
  update public.activity
  set stars = stars + 1
  where id = 1
  returning * into r;

  if not found then
    raise exception 'activity row id=1 not found';
  end if;

  return json_build_object(
    'stars', r.stars,
    'target', r.target
  );
end;
$$;

grant select on public.activity to anon, authenticated;
grant update on public.activity to authenticated;

grant execute on function public.get_activity() to anon, authenticated;
grant execute on function public.increment_stars() to anon, authenticated;

-- =========================================================
-- 初始化完成
-- 默认目标：500
-- 默认星星：0
-- =========================================================
