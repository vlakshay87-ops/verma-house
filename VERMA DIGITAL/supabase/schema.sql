create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone_number text not null check (phone_number ~ '^\+91[6-9][0-9]{9}$'),
  business_name text check (business_name is null or char_length(business_name) <= 150),
  service_interest text check (
    service_interest is null or service_interest in (
      'Performance Marketing',
      'Google Ads Management',
      'Meta Ads Management',
      'Search Engine Optimization',
      'Website Design & Development',
      'Landing Pages & CRO',
      'Local SEO',
      'Marketing Strategy',
      'Analytics & Conversion Tracking'
    )
  ),
  preferred_contact_time text check (
    preferred_contact_time is null or preferred_contact_time in (
      'Morning (9 am–12 pm)',
      'Afternoon (12–4 pm)',
      'Evening (4–7 pm)'
    )
  ),
  consent boolean not null check (consent),
  source_page text not null check (source_page ~ '^/[A-Za-z0-9/_-]*$'),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant all on table public.leads to service_role;

create table if not exists public.lead_rate_limits (
  fingerprint text primary key check (fingerprint ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.lead_rate_limits enable row level security;
revoke all on table public.lead_rate_limits from anon, authenticated;
grant all on table public.lead_rate_limits to service_role;
create index if not exists lead_rate_limits_window_started_at_idx
  on public.lead_rate_limits (window_started_at);

create or replace function public.consume_lead_rate_limit(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid rate-limit fingerprint';
  end if;

  delete from public.lead_rate_limits
  where window_started_at <= now() - interval '1 day';

  insert into public.lead_rate_limits as limits (fingerprint, window_started_at, request_count)
  values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update
  set window_started_at = case
        when limits.window_started_at <= now() - interval '15 minutes' then now()
        else limits.window_started_at
      end,
      request_count = case
        when limits.window_started_at <= now() - interval '15 minutes' then 1
        else limits.request_count + 1
      end
  returning request_count into current_count;

  return current_count <= 5;
end;
$$;

revoke all on function public.consume_lead_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_lead_rate_limit(text) to service_role;
