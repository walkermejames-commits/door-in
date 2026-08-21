# Door In platform

Door In is a single operating platform for two independent local-service businesses:

- **Door in Four** — buyer-led collection and delivery for items already owned.
- **Doorin5** — concierge shopping and delivery, with a basket cap, itemised markup and fulfilment-float control.

They share the logistics core but never share a public brand, pricing model, terms or customer journey.

## What is implemented

- Separate branded journeys at `/door-in-four` and `/doorin5`.
- Supabase-authenticated customer requests, shared administrator controller, driver workspace and one shared driver onboarding process.
- Drivers can apply for Door in Four, Doorin5, or both; only an administrator can approve and activate driver access.
- Reuse adapter for the existing Door in Four booking, quote, payment, dispatch and driver tables, with an additive Doorin5 fulfilment extension.
- Unit tests for shopping economics and service-specific state guards.

## What is deliberately not live yet

This repository must **not** take real payments until the items below are complete:

1. Apply and validate all three migrations in an isolated Supabase project; run RLS advisors and role tests.
2. Bootstrap the first administrator user after creating the first authenticated account.
3. Server-only Stripe Checkout, signed webhook processing, idempotency and refunds.
4. Private proof/receipt uploads via signed URLs and mandatory proof before delivery completion.
5. Notifications, support workflows, monitoring, rate limits and production deployment checks.

## Local start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an account, then submit a customer request or driver application. Data persists once Supabase is configured and the additive migration is applied.

## Cloudflare delivery plan

The platform is configured for the Cloudflare OpenNext adapter. It keeps both businesses in one secure deployment while presenting distinct public entrances:

- `doorinfour.jameseventures.com` opens Door in Four only.
- `doorin5.jameseventures.com` opens Doorin5 only.
- `/driver` and `/operations` remain shared, role-controlled workspaces.

Before any public deployment, set these Worker environment values in Cloudflare:

```text
NEXT_PUBLIC_SUPABASE_URL=https://djmkqmvpmhhozzguhqot.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service-role key>
FAKE_PAYMENTS_ENABLED=true
```

`SUPABASE_SERVICE_ROLE_KEY` must be stored as a Cloudflare secret, never committed or put in a `NEXT_PUBLIC_` variable. With `FAKE_PAYMENTS_ENABLED=true`, the human-test checkout records a test payment but never contacts Stripe. Switch that flag off before any non-test deployment.

Use `pnpm preview` to test the Workers runtime and `pnpm deploy` only after the secret is present. Then attach the two custom subdomains to the Worker; do not replace `jameseventures.com` or `www.jameseventures.com`.

## Enable controller and driver access

1. Use the existing Supabase project and set its public URL/key plus the server-only service-role and Stripe variables in `.env.local`.
2. Apply the three files in `supabase/migrations/` in an isolated project first, in filename order.
3. Sign up the first administrator, then run `supabase/BOOTSTRAP_ADMIN.sql` with that user's `auth.users.id` and email.
4. Sign in as that administrator and open `/operations` to review/approve driver onboarding submissions.
5. An approved driver then signs in and opens `/driver`; their jobs from both services appear in the same workspace, labelled by service.

Before exposing live orders, verify every RLS policy and transition using separate customer, driver and administrator accounts. Existing legacy public tables currently require an RLS remediation migration before the app is production-ready; see [existing project adoption](./supabase/EXISTING_PROJECT_ADOPTION.md). Supabase recommends validating identity with `getClaims()` rather than trusting an unvalidated session object; this code follows that pattern. [Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)

## Architecture and reuse boundary

- Shared: identity, job states, service zones, payments, dispatch, drivers, proof, events, support and operational reporting.
- Door in Four only: collection quote, item/handling model, seller/buyer handover.
- Doorin5 only: basket RRP, customer spending cap, substitutions, restricted-goods controls, receipt reconciliation and float ledger.

See [ROADMAP.md](./ROADMAP.md) for the full cross-referenced implementation plan.
