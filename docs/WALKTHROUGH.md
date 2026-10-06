# Kasbon — Code Walkthrough & Interview Guide (`docs/WALKTHROUGH.md`)

This document is designed to prepare the repo owner for the technical code interview and Loom video recording.

---

## 1. Loom Video Outline (Max 3 Minutes)

- **0:00–1:00 Demo:** Signup → Empty state → Create `owed_to_me` (Rp 1.234.000) and `i_owe` (Rp 400.000) entries → Show Net hero card (+Rp 834.000) → Filters → Tap *Tandai lunas* → Hard refresh (remains lunas) → Edit → Delete modal → Switch to 375px mobile viewport → Show `scripts/rls-check.sh` output.
- **1:00–2:00 Proud Decision:** RLS-first security design. Database policies strictly guard ownership (`auth.uid() = user_id`). The API uses user-scoped clients (no service role key ever used). Database trigger ensures idempotent settlement timestamp preservation.
- **2:00–3:00 What's Lacking:** Be honest and direct (e.g. absence of automated API integration test suite with Playwright, and list limit set to 500 rows without pagination).

---

## 2. Answers to Interview Questions (§18 Prep)

### Q1: Why `(select auth.uid())` in RLS policies instead of `auth.uid()`?
> `(select auth.uid())` is evaluated **once per SQL statement** by Postgres, whereas `auth.uid()` without `select` is evaluated **per row**. Wrapping it in `select` significantly improves query performance over large datasets.

### Q2: Why does accessing another user's debt ID return HTTP 404 instead of 403?
> Returning 403 Forbidden leaks the existence of a record to an unauthorized user. Returning **404 Not Found** conceals whether the ID exists at all, preventing resource enumeration attacks.

### Q3: `getClaims()` vs `getSession()` on the server?
> `getSession()` reads cookie data without verifying the JWT signature on every call, which can be spoofed on the server. **`getClaims()`** cryptographically validates the JWT signature on the server runtime, providing tamper-proof authentication (`claims.sub` = user ID).

### Q4: Why `bigint` for amounts in PostgreSQL and integer Rupiah capped at 1 Trillion?
> Storing currency as whole integers eliminates floating-point precision errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). Capping at 1 Trillion (`1_000_000_000_000`) keeps values well within JavaScript's safe integer limit (`Number.MAX_SAFE_INTEGER` = 9,007,199,254,740,991).

### Q5: Why an extra `debt_date` column and why is summary an RPC?
> - `debt_date`: `due_date` is typically a future date, whereas relative time ("3 hari lalu") calculates when the debt occurred. Adding `debt_date` (defaulting to today in WIB) solves this ambiguity (D1).
> - `debt_summary()` RPC: PostgREST caps REST API row returns at 1000 items. An RPC calculates sums directly in PostgreSQL in one round trip, while `SECURITY INVOKER` ensures RLS rules still apply.

### Q6: What does `src/proxy.ts` do, and why doesn't it redirect `/api/*`?
> `src/proxy.ts` is Next.js 16's rename of middleware running on Node.js. It refreshes Supabase auth cookies and redirects unauthenticated HTML page requests to `/login`. API routes (`/api/*`) are excluded from HTML redirects because clients expect a standard `401 JSON` response.

### Q7: What happens if two browser tabs mark the same debt as lunas at the same time?
> The PostgreSQL trigger `debts_before_update` checks `if old.settled_at is not null and new.settled_at is not null then new.settled_at := old.settled_at`. The second update retains the original `settled_at` timestamp, guaranteeing idempotency.

### Q8: How does the optimistic update roll back on failure?
> React Query's `useToggleSettled` hook uses `onMutate` to cancel outgoing refetches, take a snapshot of the cached debts (`previousQueries`), and mutate the cache directly. If the API request throws an error, `onError` restores the exact snapshot.

### Q9: Why native `Intl` and a custom relative date formatter instead of `date-fns` or `Intl.RelativeTimeFormat`?
> - Avoids adding extra dependencies (`date-fns`).
> - Native `Intl.RelativeTimeFormat` produces "3 hari yang lalu", whereas the brief explicitly requires "3 hari lalu".
> - Custom calculation computes calendar day differences in the **`Asia/Jakarta` (WIB)** timezone to prevent midnight UTC boundary bugs.

### Q10: How would you add pagination, API integration testing, or partial payments?
> - **Pagination:** Add cursor-based pagination (`created_at` or `debt_date`) or offset limits in `/api/debts`.
> - **API Integration Tests:** Setup Playwright / Vitest test runners against local Supabase CLI instance.
> - **Partial Payments:** Add a `debt_payments` ledger table with FK `debt_id` and calculate remaining balance (`amount - sum(payment_amount)`).

---

## 3. Core File Map & Explanations

| File Path | Purpose & Key Logic |
|---|---|
| `supabase/migrations/20261006000000_create_debts.sql` | Table schema, `debts_before_update` trigger, strict RLS policies, and `debt_summary()` RPC function. |
| `scripts/rls-check.sh` | Bash & curl automated leak test executing 12 security assertion checks. |
| `src/proxy.ts` | Next.js 16 request proxy that refreshes Supabase SSR sessions and guards pages. |
| `src/lib/env.ts` | Zod schema enforcing valid Supabase environment variables statically. |
| `src/lib/copy.ts` | Centralized deck of all casual Indonesian UI and error copy. |
| `src/lib/format/rupiah.ts` | `formatRupiah` & `parseRupiahInput` pure functions with unit tests. |
| `src/lib/format/relative-date.ts` | `formatRelativeDay` in `Asia/Jakarta` calendar days with unit tests. |
| `src/lib/validation/debt.ts` | Shared Zod schemas for client form inputs and server API route validation. |
| `src/app/api/debts/route.ts` | GET (filtered list & summary RPC) and POST route handlers. |
| `src/app/api/debts/[id]/route.ts` | PATCH (partial update & idempotent lunas) and DELETE route handlers. |
| `src/components/debts/DashboardClient.tsx` | Main dashboard client orchestrator with list, group, and bar chart view modes. |
