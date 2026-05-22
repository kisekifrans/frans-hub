# Multi-tenant public release plan

**Product:** Kawaragi.io — lifestyle-driven AI financial companion (Indonesia-first).  
**UX guardrail:** Keep existing glass, minimal, mobile-first UI. No spreadsheet/banking-portal redesign.  
**Deferred:** Midtrans/checkout, production SaaS billing UI (DB skeleton in `016` only).

Target product shape:

| Surface | Who | URL example |
|---------|-----|-------------|
| Public link hub | Anyone (read) | `https://agisna.dev/frans` (middleware rewrites → `/hub/frans`) |
| Link editor | Logged-in owner | `https://agisna.dev/dashboard` (or `/id/dashboard`) |
| Personal finance | Logged-in owner | `https://agisna.dev/finance` |
| Site admin (you) | Site owner only | `https://agisna.dev/id/admin` |
| Free tools (typing, audit, …) | Optional: public or gated later | `/id/tools/...` |

**Not in v1 public launch:** Academic Audit OpenAI proxy without auth, Quick Reply admin tool for all users.

---

## Current state (single-tenant)

- One profile: `profiles.slug = 'main'` hardcoded in `hub-service.ts`, `finance-service.ts`, `gear-service.ts`.
- No `profiles.user_id` → no link between Supabase Auth and data.
- RLS uses a **hardcoded admin email** in SQL, not `auth.uid()`.
- Login + OAuth callback **reject non-admin** users.
- Public home is `/{locale}` (e.g. `/id`), not `/{username}`.
- `finance_subscriptions` = **recurring expense tracking** (Netflix, Spotify), not SaaS billing.

---

## Architecture decisions

### 1. Public username URLs (root slug)

Use **non-localized** paths for link hubs so shares stay short:

```
agisna.dev/frans     → public profile (slug = frans)
agisna.dev/id        → marketing / your main site (locale home)
agisna.dev/finance   → owner finance app (auth required)
```

**Reserved slugs** (must not be claimable): `id`, `en`, `zh`, `admin`, `finance`, `login`, `auth`, `api`, `tools`, `gear`, `main`, `_next`, `favicon.ico`, etc. See `lib/auth/reserved-slugs.ts`.

**Slug rules:** `^[a-z0-9][a-z0-9_-]{2,29}$`, unique, changeable max 1× per 30 days (optional business rule).

### 2. Profile ownership

```text
auth.users (Supabase Auth)
    └── profiles.user_id (1 default profile per user at signup)
            ├── blocks
            ├── analytics_events
            └── finance_* (all already have profile_id)
```

On first sign-up (trigger or API route):

1. Create `profiles` row with `user_id = auth.uid()`, default slug from email or chosen at onboarding.
2. Seed default blocks / finance categories (reuse existing seed helpers).

Your existing `main` profile: backfill `user_id` to your auth UUID once; keep slug `main` or redirect `main` → `frans`.

### 3. Roles

| Role | How | Access |
|------|-----|--------|
| **Visitor** | Anonymous | Read published profiles + enabled blocks; insert analytics |
| **Member** | Any authenticated user with `profiles.user_id = auth.uid()` | Edit own profile, blocks, finance |
| **Site admin** | `site_admins` table or `ADMIN_EMAIL` | Gear, edge cases, global settings, all profiles (support) |

Finance and link editing use **member** RLS, not admin email.

### 4. Row Level Security pattern

Replace email checks with:

```sql
-- owns profile row
profiles.user_id = auth.uid()

-- owns data row
exists (
  select 1 from profiles p
  where p.id = finance_transactions.profile_id
    and p.user_id = auth.uid()
)

-- site admin bypass
exists (select 1 from site_admins sa where sa.user_id = auth.uid())
```

Keep admin policies during migration with `OR is_site_admin()` until cutover.

### 5. Middleware

| Path | Auth |
|------|------|
| `/finance/**` | Must be logged in; any member (not admin-only) |
| `/admin/**`, `/id/admin/**` | Logged in + site admin |
| `/login` | Public; redirect members → `/dashboard`, admin → `/admin` |
| `/[slug]` | Public read (page loads profile by slug) |
| `/api/tools/academicaudit/**` | **Require auth or API key** before public launch |

### 6. Finance per user

Schema is already per `profile_id`. Work required:

1. `resolveProfileId()` → `resolveProfileForUser(supabase)` using session, not `slug = 'main'`.
2. Add `profile_id` to all update/delete queries (defense in depth).
3. Storage `finance-imports`: RLS path `imports/{profile_id}/...` must match `profile_owned_by_user`.
4. Middleware: protect `/finance` for any authenticated owner.

### 7. SaaS subscriptions (Indonesia only)

**New tables** (see migration `016_multi_tenant_foundation.sql`):

| Table | Purpose |
|-------|---------|
| `billing_plans` | Plan catalog (free, pro); `region = 'ID'`, prices in IDR |
| `billing_subscriptions` | User ↔ plan, status, period end |
| `billing_payments` | Payment attempts, gateway refs, e-wallet channel |

**Do not confuse** with `finance_subscriptions` (user's Netflix/utility bills).

**Indonesia gating:**

- Plans flagged `country_code = 'ID'` or `available_regions @> '{ID}'`.
- At checkout: require `profiles.country_code = 'ID'` or verified `+62` phone (Supabase user metadata).
- Optional: block non-ID timezones only as soft signal (not reliable alone).

**Payment provider (recommended): [Midtrans](https://midtrans.com)** or **Xendit**

Both support Indonesian e-wallets in one integration:

| Method | Midtrans | Notes |
|--------|----------|-------|
| GoPay | `gopay` | |
| OVO | `ovo` | |
| DANA | `dana` | |
| ShopeePay | `shopeepay` | |
| QRIS | `qris` | |
| Bank VA | `bank_transfer` | |

**Flow:**

```text
Client → POST /api/billing/create-payment (server, auth required)
      → Midtrans Snap / Core API (server uses MIDTRANS_SERVER_KEY)
      → User pays in GoPay/OVO app
      → POST /api/billing/webhook (verify signature, idempotent)
      → Update billing_subscriptions + billing_payments
```

**Env vars (server-only):**

```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=          # optional for Snap UI
MIDTRANS_IS_PRODUCTION=false
BILLING_WEBHOOK_SECRET=       # optional extra HMAC
```

Never expose server keys as `NEXT_PUBLIC_*`.

**Free tier:** Default plan `free` on signup — link hub + finance with limits (e.g. 20 blocks, 1 PDF import/month). Pro unlocks via active `billing_subscriptions`.

### 8. Auth UX changes

| Today | Target |
|-------|--------|
| Login rejects non-admin | Allow any user; route by role |
| `/auth/callback` signs out non-admin | Create/link profile; redirect `/dashboard` or `next` |
| `/api/auth/verify` admin-only | Split: `/api/auth/session` (any user) + admin check where needed |

**Onboarding:** After first login → choose slug → create profile → `/dashboard`.

### 9. What stays “site owner only”

- Gear page content (unless you later allow per-user gear)
- Edge cases admin
- Hub-wide theme for `main` marketing site
- Academic Audit (until rate-limited / paid tier)

---

## Implementation phases

### Phase 1 — Foundation (DB + helpers) ✅ migration + app hooks

- [ ] Run `supabase/migrations/016_multi_tenant_foundation.sql`
- [ ] Insert your user into `site_admins` (SQL in migration comments)
- [ ] Backfill `profiles.user_id` for existing `main` profile

**App:** `reserved-slugs.ts`, `profile.ts`, `site-admin.ts`, owner RLS in `016`.

### Phase 2 — Auth for all users ✅ (implemented)

- [x] Open sign-in (`LoginForm`, `auth/callback`, bootstrap)
- [x] `POST /api/auth/bootstrap`, `GET /api/auth/session`
- [x] Middleware: `/finance` + `/dashboard` require login; site admin only on `/admin`

### Phase 3 — Public slug routes ✅ (implemented)

- [x] Public URLs `/frans` via middleware rewrite → `app/hub/[slug]/page.tsx`
- [x] `fetchHubBySlug` / `fetchHubForUser` in `hub-service`
- [x] `/dashboard` — link editor (same glass UI as admin, user-scoped)
- [ ] Slug picker / rename onboarding (optional polish)

### Phase 4 — Per-user finance ✅ (implemented)

- [x] `finance-service` resolves profile via `auth.uid()`
- [x] Owner RLS policies in `016` (run migration)
- [x] Mutations scoped with `profile_id`
- [x] PDF purge after processing + upload validation

### Phase 5 — Indonesia billing ⏸ deferred

- Tables exist in `016`; **no checkout or payment routes**
- Implement only when ready for paid tiers

### Phase 6 — Hardening ✅ (partial) + product intelligence (next)

- [x] Academic Audit routes require login; health no longer leaks `apiUrl`
- [x] Analytics rate limit (per IP)
- [ ] AI spending personality, financial feed, monthly recap (preserve current finance UI shell)
- [ ] `site_admins` backfill; rotate keys before wide launch

---

## URL map (target)

```text
/                     → redirect /id (or landing)
/id, /en, /zh         → localized marketing / owner main hub
/frans                → Frans public link page
/login                → sign up / sign in
/dashboard            → edit my links (auth)
/finance              → my finance (auth)
/finance/settings     → includes plan / upgrade (Phase 5)
/id/admin             → site admin only
/api/billing/webhook  → Midtrans IPN (no auth; signature verify)
```

---

## Data migration checklist (production)

1. Run migration 016 in Supabase SQL editor.
2. `select id, email from auth.users` → set `profiles.user_id` on `main`.
3. `insert into site_admins (user_id) values ('your-uuid');`
4. Deploy app Phase 2+ before opening public sign-up.
5. Configure Midtrans production keys only on Vercel production.

---

## Open questions (decide before Phase 3)

1. **Marketing home:** Keep `/id` as your personal `main` profile, or separate landing + `/frans` only?
2. **Free sign-up:** Open registration or invite-only beta?
3. **Custom domains:** `links.frans.com` later (CNAME) — out of scope v1.
4. **Finance on free tier:** Full finance for all users, or Pro-only PDF import?

---

## File index (to create / touch)

| Area | Files |
|------|-------|
| Docs | `docs/MULTI_TENANT_RELEASE.md` (this file) |
| Migration | `supabase/migrations/016_multi_tenant_foundation.sql` |
| Slugs | `lib/auth/reserved-slugs.ts` |
| Auth | `lib/auth/profile.ts`, `lib/auth/site-admin.ts` |
| Routes | `app/[slug]/page.tsx`, `app/dashboard/...` |
| Middleware | `middleware.ts`, `lib/i18n/paths.ts` |
| Services | `hub-service.ts`, `finance-service.ts` |
| Billing | `app/api/billing/*`, `lib/billing/midtrans.ts` |
