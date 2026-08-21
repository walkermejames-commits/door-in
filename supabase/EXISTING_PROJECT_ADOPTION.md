# Existing Supabase adoption

Project: `djmkqmvpmhhozzguhqot`.

This rebuild reuses the existing Door in Four operational data model:

- `users`, `buyer_profiles`, `driver_profiles`, and `driver_documents`
- `quotes`, `bookings`, `booking_items`, `payments`, and `payouts`
- `status_events`, proof records, dispatch timers, and intervention tasks

The migrations are additive. They add a `service_brand` to shared bookings, a
single `shopping_orders` extension for Doorin5, cross-business driver
eligibility, then put the shared public tables behind server-only RLS. They do
not replace the existing schema or delete data.

## Required release order

1. Create an isolated Supabase project (or a development branch on a Pro plan)
   and apply migrations `202608210001` through `202608210003` there, in order.
2. Add the project URL, publishable key, service-role key, and Stripe keys to
   the new app's deployment environment. The service-role key must remain
   server-only.
3. Test buyer signup, Door in Four request, Doorin5 request, driver onboarding,
   administrator approval, assignment, every driver status transition, payment
   webhook, and refund/payout behaviour.
4. Confirm that all server applications use their server-only service-role
   clients; browser code must not query public tables directly.
5. Only then apply all three migrations to production and move traffic.

## Current security blocker

The supplied project currently reports RLS disabled on multiple public tables,
including `users`, `driver_profiles`, `booking_items`, `status_events`, and
vehicles. The hardening migrations use a server-only pattern: RLS is enabled
and no anon/authenticated table policies are left in place. The legacy admin
and seller servers use service-role clients and continue to work; direct public
table access is intentionally blocked. Do not apply this to production until
that assumption is confirmed for every active client.
