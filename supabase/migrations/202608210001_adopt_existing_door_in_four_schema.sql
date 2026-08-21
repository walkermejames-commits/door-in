-- ADDITIVE migration for project djmkqmvpmhhozzguhqot.
-- This project already contains the Door in Four buyer-led delivery schema.
-- It deliberately does not recreate users, bookings, drivers, quotes, payments,
-- or their existing enums. Run in a Supabase development branch first.

begin;

alter table public.bookings
  add column if not exists service_brand text not null default 'door_in_four',
  add column if not exists request_reference text not null default ('DI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_service_brand_check') then
    alter table public.bookings
      add constraint bookings_service_brand_check check (service_brand in ('door_in_four', 'doorin5'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_request_reference_key') then
    alter table public.bookings
      add constraint bookings_request_reference_key unique (request_reference);
  end if;
end $$;

alter table public.driver_profiles
  add column if not exists service_brands text[] not null default array['door_in_four', 'doorin5']::text[],
  add column if not exists onboarding_status text not null default 'pending_documents',
  add column if not exists legal_name text,
  add column if not exists onboarding_notes text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.bookings
  add column if not exists item_title text,
  add column if not exists item_size text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'driver_profiles_service_brands_check') then
    alter table public.driver_profiles
      add constraint driver_profiles_service_brands_check
      check (cardinality(service_brands) > 0 and service_brands <@ array['door_in_four', 'doorin5']::text[]);
  end if;
end $$;

create table if not exists public.shopping_orders (
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  goods_budget_amount numeric(12,2) not null check (goods_budget_amount >= 0),
  goods_markup_amount numeric(12,2) not null check (goods_markup_amount >= 0),
  restricted_items boolean not null default false,
  id_check_required boolean not null default false,
  substituted_items_approved boolean not null default false,
  fulfilment_status text not null default 'awaiting_quote'
    check (fulfilment_status in ('awaiting_quote', 'funds_authorised', 'shopping', 'completed', 'blocked', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_orders enable row level security;
create index if not exists bookings_service_brand_created_at_idx on public.bookings (service_brand, created_at desc);
create index if not exists driver_profiles_service_brands_idx on public.driver_profiles using gin (service_brands);

commit;

-- SECURITY FOLLOW-UP (deliberately separate): public.users, driver_profiles,
-- booking_items, status_events, and several other existing tables currently
-- have RLS disabled. Do not turn it on in production until each service path is
-- tested with a least-privilege policy set in a development branch.
