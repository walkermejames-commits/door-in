# Doorin5 and Door in Four — business portfolio review and delivery plan

## Decision summary

Keep these as **two separate businesses with one shared operating platform**.

- **Doorin5** is a local concierge shopping service: a customer asks Doorin5 to buy named goods, Doorin5 charges the basket price plus a markup and delivery, and operations must manage the cash float used to purchase the goods.
- **Door in Four** (the `Inventory-application-` repository) is a collection-and-delivery marketplace: a buyer requests collection of an existing item, receives a transport quote, pays, and a driver verifies collection and delivery.

They should not be presented as a single app. Their promise, pricing, risk, terms, and customer journey differ. They should share the parts that do not define the business: identity, address/service-area validation, payments, job state, dispatch, drivers, proof, notifications, support, observability, and accounting controls.

**Recommended platform owner:** Door in Four. Its workspace structure, typed state machine, database model, quote engine, test coverage, and separate admin/seller/mobile surfaces are materially ahead of Doorin5 for the common logistics core. Doorin5 should be a service module and branded web journey built on that platform.

## Evidence reviewed

| Repository | Current shape | Strongest assets | Important gaps |
| --- | --- | --- | --- |
| Doorin5 | One Next.js app with customer, fulfilment-centre, driver, tracking and money pages; Supabase and Stripe paths plus demo fallback | Basket economics, fulfilment-float ledger, restricted-item check, concise local-pilot workflow | Most non-demo access is not yet authenticated/authorised; operational data model is less complete; customer-facing shopping and substitutions are still basic |
| Door in Four / Inventory application | pnpm monorepo: admin Next.js app, seller/buyer Next.js app, Expo mobile app, shared types/workflow/pricing/db packages | Typed booking state machine, quote pricing, dispatch, handover/delivery proof, payout/dispute/refund schema, validation/sanitisation, workspace tests | Mobile still uses demo identity/mock job detail; live production controls, real money movement, notifications, and full role auth/RLS validation still need completion |

## Capability overlap and reuse map

Tags in the to-do list refer to these overlap groups.

| Tag | Shared capability | Reuse source of record | Do not duplicate |
| --- | --- | --- | --- |
| `O1` | Roles, account identity, route protection, RLS | Door in Four database roles + shared packages; finish centrally | Doorin5 pilot passcode gate (`src/proxy.ts`, `PilotAccessGate.tsx`) is demo-only, not a production identity system |
| `O2` | Booking/order state machine, audit trail, cancellation/dispute/refund | Door in Four `packages/types`, `packages/shared`, `packages/db` | Doorin5's simpler `order-repository.ts` states should map into the canonical workflow rather than evolve separately |
| `O3` | Address/postcode/service-zone validation and ETA inputs | Door in Four seller address/postcode components and geography flow | Doorin5's local postcode check can remain a product rule but should call the shared service |
| `O4` | Quotes, pricing, checkout, webhooks, refunds and payout records | Door in Four pricing package, Stripe endpoints and payment tables | Doorin5 keeps its distinctive basket/markup calculation as a plug-in; do not copy Door in Four's transport-only price as the shopping price |
| `O5` | Dispatch, driver availability, jobs and progress | Door in Four admin/mobile flow and driver/vehicle tables | Doorin5 FC and driver screens should consume the common job API, not maintain a parallel queue |
| `O6` | Pickup/delivery proof, photos, handover codes, age/restricted-item evidence | Door in Four proof photo + code model, extended with Doorin5 age check | Doorin5's text-only proof must not become a separate storage implementation |
| `O7` | Customer tracking, transactional notifications and support updates | Door in Four tracking/status events; build a shared notification service | Avoid separate tracking event formats and separate SMS/email providers |
| `O8` | Admin reporting, ledger, monitoring, fraud/rate limiting and release checks | Door in Four admin/data model and tests, incorporating Doorin5 float ledger | Doorin5 `/money` is valuable domain logic, but not a full accounting/monitoring platform |

## Delivery rules

1. **One canonical schema and API contract.** Put reusable entities in the Door in Four workspace; expose a service type of `collection_delivery` or `shop_and_deliver`. Doorin5 gets a branded frontend and a small domain module, not a copied backend.
2. **No production feature may depend on demo fallback or service-role access from an unauthenticated browser route.** Retain demo mode only behind explicit non-production configuration.
3. **Use a shared event vocabulary.** Every state change writes an immutable actor, timestamp, reason and metadata event. Both businesses can render the same event differently.
4. **Separate ledgers.** A delivery payout ledger and Doorin5 fulfilment-float ledger can share accounting primitives, but must retain distinct entries, owners, balances, and reconciliation rules.
5. **Ship one controlled pilot at a time.** First validate one Door in Four collection delivery; then validate one Doorin5 shopped basket. Do not launch both publicly at once.

## Phase 0 — portfolio and safety decisions (both businesses)

- [ ] **P0 / Founder:** Confirm the positioning and names above in a one-page business brief. Decide whether Door in Four is consumer-only, seller-assisted, or both; decide which Doorin5 item categories are permitted. `O1 O4 O6`
- [ ] **P0 / Founder + legal adviser:** Write separate terms, privacy, cancellation/refund, prohibited goods, age-restricted goods, and driver/merchant terms for each business. Shopping on a customer’s behalf carries substitution, product-liability and age-verification risks that collection delivery does not. `O6 O7`
- [ ] **P0 / Engineering:** Create a private platform repository or make Door in Four the platform repository; document ownership and versioning for shared packages. Do not copy whole folders between repos. `O1–O8`
- [ ] **P0 / Engineering:** Freeze changes to duplicated workflow code while the canonical contract is designed. Record every existing API and database state that must migrate. `O2 O4 O5`
- [ ] **P0 / Security:** Remove development passcodes and demo identities from any deployed production environment; verify no service-role key is exposed to the client. `O1`
- [ ] **P0 / Operations:** Define human escalation rules: failed pickup, customer unreachable, item unavailable, substitution approval, damage, age-check failure, payment dispute, driver incident, and refund authority. `O2 O6 O7 O8`

## Phase 1 — build the common operating platform once

- [ ] **P1 / Platform:** Complete Supabase Auth for customer, driver, operations and administrator roles. Link auth users to profiles and apply/verify role-specific RLS. Start from Door in Four `users`, `buyer_profiles`, `driver_profiles` and `user_role`; do not extend Doorin5's passcode protection. `O1`
- [ ] **P1 / Platform:** Define one state-machine package and transition policy. Extend Door in Four `BookingStatus` only after mapping Doorin5 states such as `request_submitted`, `fc_reviewing`, `quote_sent`, `shopping`, and `float_blocked`. Require the transition guard on every mutation route. `O2`
- [ ] **P1 / Platform:** Adopt Door in Four's `status_events`, payments, refunds, disputes, driver profiles, vehicles, booking items and proof-photo records as the common base. Add `service_type`, `brand`, and domain-specific tables instead of a second `delivery_orders` family. `O2 O5 O6 O8`
- [ ] **P1 / Platform:** Extract Door in Four's input sanitation, Zod schemas, pricing tests and environment validation into published internal workspace packages. Apply them to every Doorin5 endpoint and form. `O1 O3 O4`
- [ ] **P1 / Platform:** Create a shared geography service: canonical UK postcode normalisation, address lookup, distance/route provider abstraction, service-zone rules, coverage messages and cache limits. Reuse Door in Four seller components as the UI starting point. `O3`
- [ ] **P1 / Platform:** Create a shared Stripe boundary: server-only keys, idempotency keys, signed webhooks, persisted payment attempts, receipts, refunds and reconciliation. Reuse Door in Four’s payment/webhook model; replace any remaining Doorin5 local test-payment customer path before live traffic. `O4 O8`
- [ ] **P1 / Platform:** Standardise file storage for proof, driver documents and incident photos using private buckets, signed URLs, malware/size/type checks, retention policy and RLS. Reuse Door in Four's photo types and handover-code concept; add age-check evidence rules from Doorin5. `O6`
- [ ] **P1 / Platform:** Create a notification interface for email/SMS/push: order received, quote ready, payment receipt, driver assignment, progress, arrival, issue and completion. Persist delivery attempts and opt-out state. `O7`
- [ ] **P1 / Platform:** Add audit logging, rate limits, request validation, error tracking, uptime checks, structured logs and a production readiness endpoint. Doorin5’s readiness approach is a good UI concept; Door in Four’s launch checklist is a good release mechanism. `O8`
- [ ] **P1 / QA:** Build one CI pipeline: typecheck, unit tests, migration validation, lint, build, secret scan and browser happy-path tests for both branded apps. Door in Four already has workflow/pricing tests; Doorin5 has smoke scripts that should be converted into CI checks. `O2 O4 O8`

## Phase 2A — Door in Four business backlog

### Finish the collection-and-delivery commercial flow

- [ ] **P1:** Make the seller/buyer flow choose an explicit service: existing-item collection/delivery only. Keep it free of Doorin5 shopping language, markup and float. `O4`
- [ ] **P1:** Complete quote lifecycle: immutable quote version, expiry, acceptance, price override reason, cancellation fee calculation, customer consent and payment capture. Reuse `packages/pricing` and shared guards. `O2 O4`
- [ ] **P1:** Complete payment-to-dispatch gating and webhook idempotency. Dispatch must be blocked until a verified paid state; refund/cancellation actions must be role-gated and auditable. `O2 O4 O8`
- [ ] **P1:** Replace mobile demo driver identity and mock booking detail with authenticated session-bound jobs. Add driver availability, vehicle suitability and workload limits. Reuse existing mobile screens as UI, not their demo data behaviour. `O1 O5`
- [ ] **P1:** Make collection and delivery proof mandatory where applicable: time, location accuracy policy, proof photo, one-time handover/delivery code, exceptions and damage report. `O6`
- [ ] **P2:** Implement real driver onboarding/approval: right-to-work/insurance/vehicle evidence review, status expiry, suspension and re-verification. Use existing `driver_documents`, profiles and admin UI. `O1 O5 O6`
- [ ] **P2:** Finish driver payout workflow: Stripe Connect onboarding, payout calculation/override approval, payout-ready control, payout failure/retry and reconciliation. Keep this separate from Doorin5 fulfilment float. `O4 O8`
- [ ] **P2:** Add buyer self-service: tracking, address corrections before dispatch, cancellation request, support contact, proof view and dispute intake. `O2 O6 O7`
- [ ] **P2:** Add operational controls: dispatch board filters, SLA/late-job alerts, exception queue, manual assignment reason, contact log and daily reconciliation export. `O5 O7 O8`

### Door in Four launch criteria

- [ ] A real test payment is processed and replay-safe webhook handling updates exactly one booking.
- [ ] An authenticated driver can see only assigned jobs and cannot advance another driver’s booking.
- [ ] A job cannot complete without policy-compliant proof; a dispute/refund path works in test mode.
- [ ] An operations user can reconcile payment, platform fee, driver payout and refund for a booking.

## Phase 2B — Doorin5 business backlog

### Preserve the distinct shopping economics

- [ ] **P1:** Model Doorin5 as `shop_and_deliver` with a `shopping_basket`, catalogue/custom-item request, customer-approved substitutes, maximum spend, receipt, goods cost, markup, delivery fee, ID fee and fulfilment-float reservation. Bring Doorin5 `basket-pricing.ts` and `fulfilment-float.ts` into a dedicated shared domain module with tests. `O2 O4 O8`
- [ ] **P1:** Confirm the commercial charging model before live launch: whether the customer pays an estimate, an authorisation, or a final corrected amount after shopping. Implement clear consent for substitutions and price variance; never silently charge above the approved cap. `O4 O7`
- [ ] **P1:** Make float a first-class ledger, not a dashboard-only calculation: funded, reserved, spent, released, returned, Stripe payout received, refund issued and reconciliation variance. Require an operations approval before shopping when available float is insufficient. `O4 O8`
- [ ] **P1:** Replace Doorin5's local/demo order repository with the platform booking API and canonical state events. Map shopping-specific stages (`shopper_assigned`, `goods_purchased`, `substitution_pending`, `receipt_uploaded`) without weakening collection-delivery guards. `O2 O5`
- [ ] **P1:** Build a shopper job view from the shared mobile app: shopping list, approved alternatives, budget cap, receipt/photo upload, customer contact rules, ID-check step and delivery proof. Reuse the Door in Four mobile shell, jobs API and proof storage. `O5 O6`
- [ ] **P1:** Implement age-restricted fulfilment policy: category gating, shopper training acknowledgement, verified recipient age check, refusal process, no unattended delivery and retained minimum evidence. Use Doorin5’s existing age-check intent, but use common proof storage/audit events. `O1 O6`
- [ ] **P2:** Create catalogue governance: verified RRP source/date, item availability confidence, prohibited items, tax/VAT treatment, brand restrictions and regular price review. Doorin5’s starter estimates must never be treated as live prices without confirmation. `O4 O8`
- [ ] **P2:** Add merchant/retailer operating rules: receipts, refunds to original payment method, click-and-collect references, substitutions, stock-out handling and no-cash policy. `O2 O4 O7`
- [ ] **P2:** Add Doorin5-specific customer support flows: “item unavailable”, substitute approval, late shop, partial fulfilment, receipt query and basket/refund reconciliation. `O2 O7 O8`

### Doorin5 launch criteria

- [ ] One controlled real basket shows an approved spending cap, float reservation, shopper receipt, final reconciliation and customer receipt.
- [ ] A shopper cannot buy/dispatch when float is inadequate or restricted-goods requirements are unmet.
- [ ] A customer can approve/decline substitutions and receives the final itemised charge explanation.
- [ ] The finance view reconciles basket cost, markup, delivery income, processor fees, payout timing, float movement and refund.

## Phase 3 — reuse and migration execution order

1. **Create platform contracts and migrations first** (`O1`, `O2`). Do not port screens before auth, data ownership and state transitions are settled.
2. **Port Door in Four’s reusable packages into the platform baseline**: types, shared guards/sanitisation, pricing framework, database migrations, UI primitives and tests (`O2–O4`).
3. **Port Doorin5’s unique domain logic as a module**: basket calculation, fulfilment float, restricted-item decision and money/readiness views (`O4`, `O6`, `O8`). Add tests before connecting it to checkout.
4. **Refactor both UIs to consume the shared API**: Door in Four admin/seller/mobile and Doorin5 customer/FC/driver views (`O3`, `O5–O7`). Keep brand, copy and pricing separate.
5. **Migrate only seeded/demo data first.** Run dual-read or read-only verification against legacy data before moving real bookings. Do not merge production tables ad hoc.
6. **Pilot Door in Four first**, then Doorin5. Share drivers only after driver terms, training, insurance and eligibility rules cover both work types.

## Explicit “do not build twice” checklist

- [ ] One auth/RLS system (`O1`)
- [ ] One booking/event/audit model (`O2`)
- [ ] One address, postcode and service-zone provider (`O3`)
- [ ] One Stripe/webhook/refund/reconciliation layer (`O4`)
- [ ] One driver identity, availability and dispatch service (`O5`)
- [ ] One secure proof/photo/code storage system (`O6`)
- [ ] One notification/support-event service (`O7`)
- [ ] One observability, CI and release checklist framework (`O8`)

Keep separate: customer proposition, public branding, price calculation, basket/receipt/float accounting, restricted-goods policy, and business-specific terms.

## Risks that should block a public launch

- Public or weakly protected operations/driver mutation routes.
- Any Stripe mode without verified webhook signatures, idempotency and reconciliation.
- Service-role keys exposed outside server-only runtime.
- Demo identities, hard-coded jobs, mock payments or in-memory fallback treated as real orders.
- Missing RLS for customer, driver and operations data.
- Unverified driver identity/insurance and missing proof/incident process.
- Doorin5 charging without customer-approved basket caps, receipts and float controls.

