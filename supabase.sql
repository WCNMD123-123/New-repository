create table if not exists activity (
 id bigint primary key,
 stars bigint not null default 0,
 target bigint not null default 500
);
insert into activity(id,stars,target) values(1,0,500) on conflict(id) do nothing;

create or replace function increment_stars()
returns json
language plpgsql
security definer
as $$
declare r activity;
begin
 update activity set stars=stars+1 where id=1 returning * into r;
 return json_build_object('stars',r.stars,'target',r.target);
end;
$$;