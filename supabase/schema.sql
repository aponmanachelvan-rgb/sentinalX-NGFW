create extension if not exists pgcrypto;

create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  source_ip text,
  port int,
  protocol text check (protocol in ('TCP','UDP','ICMP')),
  action text check (action in ('allow','block')) not null,
  enabled boolean default true,
  created_at timestamp default now(),
  created_by uuid references auth.users(id)
);

create table if not exists traffic_logs (
  id bigint generated always as identity primary key,
  ts timestamp default now(),
  source_ip text,
  dest_port int,
  protocol text,
  action_taken text check (action_taken in ('allowed','blocked'))
);

create table if not exists blocked_ips (
  id uuid primary key default gen_random_uuid(),
  ip text unique not null,
  reason text,
  attempts int default 1,
  status text default 'blocked',
  created_at timestamp default now()
);

alter table rules enable row level security;
alter table traffic_logs enable row level security;
alter table blocked_ips enable row level security;

create policy "authenticated read rules"
on rules for select
to authenticated
using (true);

create policy "authenticated insert rules"
on rules for insert
to authenticated
with check (created_by = auth.uid() or created_by is null);

create policy "authenticated update rules"
on rules for update
to authenticated
using (created_by = auth.uid() or created_by is null)
with check (created_by = auth.uid() or created_by is null);

create policy "authenticated delete rules"
on rules for delete
to authenticated
using (created_by = auth.uid() or created_by is null);

create policy "read traffic logs"
on traffic_logs for select
using (true);

create policy "insert traffic logs"
on traffic_logs for insert
with check (true);

create policy "read blocked ips"
on blocked_ips for select
using (true);

create policy "update blocked ips"
on blocked_ips for update
using (true)
with check (true);

create policy "insert blocked ips"
on blocked_ips for insert
with check (true);

alter publication supabase_realtime add table traffic_logs;
