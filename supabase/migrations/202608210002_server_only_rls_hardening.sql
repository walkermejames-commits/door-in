-- SECURITY migration for the shared platform.
-- The legacy admin and seller apps use server-side service-role clients; the
-- rebuilt app verifies an authenticated user, then performs business actions
-- server-side. No public table needs direct anon/authenticated access.
-- Validate this migration in the isolated project before production release.

alter table if exists public.users enable row level security;
alter table if exists public.buyer_profiles enable row level security;
alter table if exists public.driver_profiles enable row level security;
alter table if exists public.driver_documents enable row level security;
alter table if exists public.vehicles enable row level security;
alter table if exists public.service_zones enable row level security;
alter table if exists public.towns enable row level security;
alter table if exists public.zone_towns enable row level security;
alter table if exists public.pricing_rules enable row level security;
alter table if exists public.pickup_contacts enable row level security;
alter table if exists public.delivery_addresses enable row level security;
alter table if exists public.quotes enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.booking_items enable row level security;
alter table if exists public.photos enable row level security;
alter table if exists public.status_events enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.refunds enable row level security;
alter table if exists public.payouts enable row level security;
alter table if exists public.disputes enable row level security;
alter table if exists public.ratings enable row level security;
alter table if exists public.messages enable row level security;
alter table if exists public.admin_notes enable row level security;
alter table if exists public.audit_events enable row level security;
alter table if exists public.prohibited_item_reports enable row level security;
alter table if exists public.shopping_orders enable row level security;

-- Remove the one legacy public booking-write policy. Seller-led bookings are
-- created by the seller server route using its service-role client.
drop policy if exists "allow_seller_led_insert" on public.bookings;

-- Remove accidental callable access to the legacy security-definer helper.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
  if to_regprocedure('public.set_driver_payout_estimate()') is not null then
    alter function public.set_driver_payout_estimate() set search_path = public, pg_temp;
  end if;
end $$;
