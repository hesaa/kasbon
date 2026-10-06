# Kasbon — PRD & AI Agent Build Guide

> **Version:** 1.0 · **Context:** Junior Fullstack Developer hiring task
> **Language of this document:** English · **Language of the app UI & API errors:** Indonesian (casual)
> **Source of truth:** the original brief ("Hiring Task – Junior Fullstack Developer"). This document restates it, resolves its ambiguities (§3), and turns it into an executable build plan.

---

## 0. Read this first (instructions for the AI agent)

You are building **Kasbon**, a small personal debt tracker, as a hiring-task submission. A human reviewer will inspect the repo, the live deploy, and then interview the owner about *every line of code*. Correctness, clarity, and explainability matter more than cleverness or feature count.

### Operating rules

1. **Read this whole document before writing code.** §3 resolves ambiguities in the original brief; follow those decisions.
2. **Build phase by phase (§14).** After each phase run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`. Fix everything, then commit.
3. **Commit after every phase** (more often is fine) with Conventional Commits. Never squash into one commit. The brief requires ≥ 5 meaningful commits; target 12–18.
4. **Strict TypeScript.** No `any`, no `as any`, no `@ts-ignore`. Avoid `!` non-null assertions (env vars are validated once in `src/lib/env.ts`). Use `unknown` + Zod narrowing for untrusted input.
5. **RLS is the security boundary.** The app only ever uses the *publishable* key together with the logged-in user's session. **Never** use, reference, or document the `service_role` / secret key in app code, env files, or README.
6. **No mock or hardcoded data in the shipped app.** Everything comes from Supabase. (Fixtures inside `*.test.ts` are fine.)
7. **Only use the libraries in §4.** Prefer not adding more. If you add one, record the reason in the README "Dependencies" section (the brief requires an explanation).
8. **Comment the *why*, not the *what*.** Non-obvious code (RLS policies, triggers, idempotent settle, timezone handling, optimistic updates) gets a short comment. The owner must be able to explain each file.
9. **If blocked on something only a human can do** (Supabase project, keys, Vercel deploy, Loom), stop and list exactly what you need (§17). Never fake credentials, URLs, or results.
10. **Never invent README facts** (time spent, demo URL, "what I'm proud of", Loom link). Leave `TODO(owner)` placeholders.
11. **Keep it simple.** Finish every P0 requirement first, then P1/P2 bonuses in order (§13). Don't over-engineer.
12. **UI work follows §11.10 (anti-slop design rules).** Write the design plan before any UI code and avoid every banned pattern listed there.

---

## 1. Product summary

**Kasbon** is a mobile-first web app where a logged-in user records personal debts:
people who owe the user money (**dihutang / `owed_to_me`**) and money the user owes to others (**saya hutang / `i_owe`**). Entries can be marked **lunas** (settled). A dashboard shows totals and a filterable list.

### Goals
- Dead-simple capture of "who owes what" in under 10 seconds on a phone.
- Always-correct totals and Rupiah formatting.
- Data privacy enforced at the database level (RLS), verifiable with `curl`.

### Non-goals (do **not** build)
Multi-currency, decimals/cents, partial payments/installments, sharing between users, reminders/notifications, file attachments, dark mode, i18n/multi-language, admin roles.

### User stories (P0)
| # | As a user, I can… |
|---|---|
| U1 | sign up and log in with email + password, and log out |
| U2 | only see app pages when logged in (otherwise → `/login`) |
| U3 | see three summary cards: *Total dihutang ke saya*, *Total saya hutang*, *Net* (green if ≥ 0, red if < 0) |
| U4 | see a list of all my entries (name, type, amount in Rp, relative date, status, actions) |
| U5 | filter the list by status (semua / belum lunas / lunas) and type (semua / dihutang / saya hutang) |
| U6 | create a new entry via a modal form |
| U7 | edit or delete an entry |
| U8 | mark an entry as lunas — persisted server-side, survives refresh, idempotent |

---

## 2. Hard requirements & auto-reject guard

The original brief lists conditions that cause **automatic rejection**. Treat them as release blockers.

| Auto-reject condition | How this plan prevents it | How to verify (must pass before "done") |
|---|---|---|
| RLS leaks data | Strict per-operation RLS, `anon` revoked, user-scoped client only, no service key | `scripts/rls-check.sh` passes (§7); output pasted in README |
| Rupiah format wrong/inconsistent | **One** `formatRupiah()` used everywhere, unit-tested | Vitest cases in §10; `grep -rn "toLocaleString\|Intl.NumberFormat" src` only hits `lib/format/` |
| "Tandai lunas" only on client | PATCH endpoint writes `settled_at` in DB; UI uses API | Mark lunas → hard refresh → still lunas |
| `any` everywhere | ESLint `no-explicit-any: error`, strict TS | `grep -rnE ":\s*any\b\|as any\|<any>" src` returns nothing |
| Mock/hardcoded data in production | All data via Supabase; empty state for new users | Fresh account shows empty state, not sample data |
| Deploy doesn't run | Deploy early (Phase 7a), smoke-test on the live URL | Sign up + create + mark lunas on the Vercel URL |
| Defensive Loom / can't explain code | `docs/WALKTHROUGH.md` (§14 Phase 7) + owner reads every file | Owner can answer §18 questions unprompted |

### Brief constraints (verbatim intent)
1. Stack is mandatory: **Next.js 16 App Router + TypeScript**, **Tailwind CSS v4**, **Supabase (PostgreSQL + Auth)**, **Lucide React**.
2. Start from an **empty Next.js project** (not a fork).
3. Copy is **casual Bahasa Indonesia**, never formal/translated-sounding.
4. Rupiah uses `id-ID` style: `Rp 1.234.000` (not `Rp 1234000`, not `IDR 1,234,000`).
5. Dates are **relative** ("kemarin", "3 hari lalu").
6. Validation on **both client and server**. API errors in Indonesian with correct HTTP status codes.
7. Commit history must be meaningful (≥ 5 commits).

### Rubric (where points come from)
DB + RLS **25%** · Code quality **20%** · UI/UX taste **20%** · Business logic **20%** · Communication (README/commits/Loom) **15%**.

---

## 3. Decisions on ambiguities in the brief

The brief is slightly inconsistent. These decisions are final unless the owner overrides them. Document each in the README under "Keputusan teknis".

| ID | Ambiguity | Decision | Why |
|---|---|---|---|
| **D1** | The form has *"Tanggal (default hari ini)"* and the list shows *"3 hari lalu"*, but the schema only has `due_date` (nullable) and `created_at`. A due date is usually in the future, so it can't be "3 days ago". | Add one extra column **`debt_date date not null`** = the date the debt happened (form field "Tanggal", default today in WIB). Relative time in the list is computed from `debt_date`. Keep **`due_date`** (nullable) as an optional form field "Jatuh tempo". All columns from the brief are kept exactly as specified; this is purely additive. | Honors the brief's schema *and* the UI requirements. |
| **D2** | What do the summary cards total? | Only **belum lunas** entries (outstanding). Cards ignore the list filters. Card subtext shows entry count, e.g. "3 catatan belum lunas". | A settled debt is no longer owed. |
| **D3** | Filter query-param values | `status`: `all` \| `unsettled` \| `settled`. `type`: `all` \| `owed_to_me` \| `i_owe`. UI labels are Indonesian; API values are English to match the DB enum. | Consistency with schema. |
| **D4** | What does "Tandai lunas" do on an already-lunas row? | PATCH `{ "settled": true }` is **idempotent** (repeating it keeps the original `settled_at`). The UI also offers **"Batal lunas"** (`{ "settled": false }` → `settled_at = null`) for misclicks. | Rubric: "status toggle idempotent". |
| **D5** | Validation status codes | `400` malformed JSON / bad query params / bad UUID; `422` field-level body validation; `401` not logged in; `404` not found *or not yours*; `500` unexpected. | "Status code yang bener". |
| **D6** | Amount input | Text input with `inputMode="numeric"`, live thousand separators (`1.234.000`), prefix "Rp", parsed to an **integer**. Max `1_000_000_000_000`. | Mobile-friendly; stays within JS safe-integer range. |
| **D7** | Email confirmation | **Disabled** in the Supabase project so reviewers can sign up and test instantly. The signup UI still handles the "confirm email" case gracefully. | "Demo harus jalan tanpa setup ulang". |
| **D8** | Timezone | "Today" and relative days are computed in **`Asia/Jakarta`** (WIB). Client always sends an explicit `debt_date`. | DB runs in UTC; between 00:00–07:00 WIB the UTC date is still "yesterday". |
| **D9** | UI ↔ API | The UI **calls the `/api/debts` endpoints** (not Supabase directly) for all debt reads/writes. Auth uses Supabase Auth directly. | The brief makes the API a graded deliverable; keeps one validated write path. |

---

## 4. Tech stack

### Required (from the brief)
| Tech | Notes |
|---|---|
| Next.js **16** (App Router) + TypeScript (strict) | Turbopack is the default bundler. Needs Node ≥ 20.9. React 19.2. |
| Tailwind CSS **v4** | CSS-first config: `@import "tailwindcss";` + `@theme { … }` in `globals.css`. **No** `tailwind.config.js`, **no** `@tailwind base/components/utilities`. |
| Supabase (Postgres + Auth) | Packages: `@supabase/supabase-js`, `@supabase/ssr`. (**Not** the deprecated `@supabase/auth-helpers-nextjs`.) |
| Lucide React | Import icons individually: `import { Plus } from "lucide-react"`. |

### Allowed extras (justify each in the README)
| Library | Why |
|---|---|
| `zod` (v4) | One schema shared by client form and API route → "validasi client + server" without duplicated rules. Also validates env vars. |
| `@tanstack/react-query` (v5) | Caching, loading/error states, and **optimistic updates with rollback** for "Tandai lunas". Keeps hooks small and reusable. |
| `vitest` (dev) | Unit tests for the pure business logic (Rupiah, relative date, net, validation). Cheap, high signal for the "Business logic" rubric. |
| *(optional)* `sonner` | Toasts. Skip it and write a ~40-line `Toast` component if you want zero extra deps. |

**Do not add:** component kits (shadcn/MUI), date libraries (`date-fns`/`dayjs` — native `Intl` is enough), form libraries, ORMs, state managers other than React Query, chart libraries (draw bars with divs/SVG).

### Next.js 16 gotchas (verified — do not code from Next 14/15 memory)
- **`proxy.ts` replaces `middleware.ts`.** File lives at `src/proxy.ts`, exports a function named **`proxy`**, runs on the Node.js runtime.
- Route handler **`params` is a Promise**: `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params`.
- `cookies()` / `headers()` are **async** → `await cookies()`.
- **`next lint` is removed** → `"lint": "eslint ."`.
- API responses are user-specific: send `Cache-Control: no-store`.

### Supabase gotchas
- Env var names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (value looks like `sb_publishable_…`; a legacy anon key also works in the same variable).
- Create clients with `createBrowserClient` (client components) and `createServerClient` (server: RSC, route handlers, proxy) from `@supabase/ssr`, typed with the `Database` type.
- **On the server, authenticate with `supabase.auth.getClaims()`** (verifies the JWT signature). Never trust `getSession()` in server code. User id = `claims.sub`.
- In `proxy.ts`: don't put code between `createServerClient(...)` and `getClaims()`, and always return the `supabaseResponse` (or copy its cookies onto any redirect you create), otherwise sessions randomly drop.
- `NEXT_PUBLIC_*` variables are inlined at build time only when referenced **statically** (`process.env.NEXT_PUBLIC_X`), so `env.ts` must reference each one explicitly, not via a loop.
- PostgREST caps responses at 1000 rows by default → we use a SQL function for summary totals (§6) and an explicit row limit for the list.

---

## 5. Project structure

```
kasbon/
├─ supabase/
│  └─ migrations/
│     └─ 20261006000000_create_debts.sql
├─ scripts/
│  └─ rls-check.sh                  # curl-based RLS leak test (§7)
├─ docs/
│  ├─ DESIGN.md                     # design plan written BEFORE UI code (§11.10-A)
│  └─ WALKTHROUGH.md                # file-by-file explainer for the owner (Loom prep)
├─ src/
│  ├─ proxy.ts                      # session refresh + redirect unauthenticated page requests
│  ├─ app/
│  │  ├─ layout.tsx                 # <html lang="id">, font, <Providers>
│  │  ├─ globals.css                # Tailwind v4 + @theme tokens
│  │  ├─ providers.tsx              # QueryClientProvider + Toaster
│  │  ├─ page.tsx                   # "/" Dashboard (server check → <DashboardClient/>)
│  │  ├─ error.tsx · not-found.tsx
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ signup/page.tsx
│  │  │  └─ actions.ts              # login / signup / logout server actions
│  │  └─ api/debts/
│  │     ├─ route.ts                # GET, POST
│  │     └─ [id]/route.ts           # PATCH, DELETE
│  ├─ components/
│  │  ├─ ui/                        # Button, IconButton, Input, Textarea, Select, Badge, Card,
│  │  │                             # Modal (native <dialog>), ConfirmDialog, Skeleton,
│  │  │                             # EmptyState, ErrorState, RadioCards
│  │  ├─ layout/Header.tsx
│  │  └─ debts/                     # DashboardClient, SummaryCards, DebtFilters, DebtList,
│  │                                # DebtItem, DebtFormModal, DebtForm, DeleteDebtDialog
│  ├─ hooks/                        # useDebts, useCreateDebt, useUpdateDebt, useToggleSettled,
│  │                                # useDeleteDebt, useDebtFilters, useDebouncedValue
│  ├─ lib/
│  │  ├─ env.ts                     # Zod-validated env
│  │  ├─ copy.ts                    # ALL user-facing Indonesian strings (single place)
│  │  ├─ supabase/{client,server,proxy}.ts
│  │  ├─ api/{auth,errors,client}.ts# requireUser(), ApiError + handler wrapper, typed fetch wrapper
│  │  ├─ format/{rupiah,relative-date}.ts  (+ *.test.ts)
│  │  ├─ validation/debt.ts         # Zod schemas shared by client + server (+ test)
│  │  └─ debts/{filters,group}.ts   # query-param parsing, group-by-person (+ tests)
│  └─ types/{database.types.ts,debt.ts}
├─ .env.example
├─ vitest.config.ts · eslint.config.mjs · tsconfig.json
└─ README.md
```

---

## 6. Database

### 6.1 Migration — `supabase/migrations/20261006000000_create_debts.sql`

```sql
-- Kasbon: debts table + strict RLS.
-- Forward-only migration. Run via Supabase SQL Editor or `supabase db push`.

create type public.debt_type as enum ('owed_to_me', 'i_owe');

create table public.debts (
  id               uuid primary key default gen_random_uuid(),
  -- default auth.uid() is a safety net; the API also sets it explicitly.
  user_id          uuid not null default auth.uid()
                     references auth.users (id) on delete cascade,
  type             public.debt_type not null,
  counterpart_name text not null,
  amount           bigint not null,                 -- whole Rupiah, never decimals
  note             text,
  -- D1: when the debt happened. WIB date, because the DB clock is UTC.
  debt_date        date not null default ((now() at time zone 'Asia/Jakarta')::date),
  due_date         date,
  settled_at       timestamptz,                     -- null = belum lunas
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint debts_name_len     check (char_length(btrim(counterpart_name)) between 1 and 100),
  constraint debts_amount_range check (amount > 0 and amount <= 1000000000000),
  constraint debts_note_len     check (note is null or char_length(note) <= 200),
  constraint debts_due_after    check (due_date is null or due_date >= debt_date)
);

create index debts_user_date_idx
  on public.debts (user_id, debt_date desc, created_at desc);
create index debts_user_unsettled_idx
  on public.debts (user_id) where settled_at is null;

-- Row-level guard rails + idempotent settle.
-- * id / user_id / created_at can never change (defense in depth next to RLS WITH CHECK).
-- * Settling an already-settled row keeps the ORIGINAL settled_at  => PATCH settled=true is idempotent.
create function public.debts_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.id         := old.id;
  new.user_id    := old.user_id;
  new.created_at := old.created_at;
  if old.settled_at is not null and new.settled_at is not null then
    new.settled_at := old.settled_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger debts_before_update
  before update on public.debts
  for each row execute function public.debts_before_update();

-- ---------- Row Level Security ----------
alter table public.debts enable row level security;

-- Nobody unauthenticated touches this table, even via the REST API.
revoke all on table public.debts from anon;
grant select, insert, update, delete on table public.debts to authenticated;

-- (select auth.uid()) is evaluated once per statement (faster than calling auth.uid() per row).
create policy "debts_select_own" on public.debts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "debts_insert_own" on public.debts
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "debts_update_own" on public.debts
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);   -- also blocks re-assigning a row to someone else

create policy "debts_delete_own" on public.debts
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------- Summary totals ----------
-- SECURITY INVOKER => runs with the caller's rights, so RLS still applies.
-- Used by the dashboard cards (correct even past PostgREST's 1000-row cap).
create function public.debt_summary()
returns table (owed_to_me bigint, i_owe bigint, open_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(sum(amount) filter (where type = 'owed_to_me'), 0)::bigint,
    coalesce(sum(amount) filter (where type = 'i_owe'), 0)::bigint,
    count(*)::bigint
  from public.debts
  where settled_at is null;
$$;

revoke execute on function public.debt_summary() from public, anon;
grant  execute on function public.debt_summary() to authenticated;
```

### 6.2 Types
- Generate with `supabase gen types typescript --project-id <id> > src/types/database.types.ts` (owner runs it), **or** hand-write a minimal `Database` type that matches the migration exactly.
- `src/types/debt.ts` exports the public DTO (no `user_id` exposed to the UI):

```ts
export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;            // whole Rupiah
  note: string | null;
  debt_date: string;         // "YYYY-MM-DD"
  due_date: string | null;   // "YYYY-MM-DD"
  settled_at: string | null; // ISO timestamp; null = belum lunas
  created_at: string;
  updated_at: string;
}

export interface DebtSummary {
  owed_to_me: number;
  i_owe: number;
  net: number;               // owed_to_me - i_owe
  open_count: number;
}
```
- Select explicit columns, never `*`: `const DEBT_COLUMNS = "id, type, counterpart_name, amount, note, debt_date, due_date, settled_at, created_at, updated_at"`.

---

## 7. RLS leak test (`scripts/rls-check.sh`)

The reviewer will try to read/edit another user's data via the Supabase REST API with the publishable key. Prove it fails.

**Script requirements** (bash + `curl` + `jq`; reads `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `USER_A_EMAIL/PASSWORD`, `USER_B_EMAIL/PASSWORD` from env; exits non-zero on the first failed assertion; prints ✅/❌ per check):

| # | Actor | Request | Expected |
|---|---|---|---|
| 1 | A | `POST $URL/auth/v1/token?grant_type=password` (header `apikey`) → `access_token` | 200 |
| 2 | B | same for B | 200 |
| 3 | A | `POST /rest/v1/debts` (`Authorization: Bearer $A_TOKEN`, `Prefer: return=representation`) | 201, returns row `A_ROW` |
| 4 | B | `GET /rest/v1/debts?id=eq.$A_ROW_ID` | `[]` |
| 5 | B | `GET /rest/v1/debts` | contains none of A's rows |
| 6 | B | `PATCH /rest/v1/debts?id=eq.$A_ROW_ID` `{"amount":1}` + `Prefer: return=representation` | `[]` **and** A re-reads → amount unchanged |
| 7 | B | `DELETE /rest/v1/debts?id=eq.$A_ROW_ID` | `[]` **and** A re-reads → row still exists |
| 8 | B | `POST /rest/v1/debts` with `"user_id": "<A id>"` | **403** / code `42501` (RLS violation) |
| 9 | B | `PATCH` own row with `{"user_id": "<A id>"}` | rejected (RLS `WITH CHECK`) or no change |
| 10 | anon | `GET /rest/v1/debts` with only `apikey` (no user JWT) | 401/403 (`42501` permission denied) |
| 11 | B | `POST /rest/v1/rpc/debt_summary` | returns only **B's** totals |
| 12 | cleanup | A deletes `A_ROW` | success |

Paste the script's real output into the README under **"Bukti RLS tidak bocor"** (the owner runs it; the agent writes the script).

---

## 8. Authentication

### Pages
- `/login`, `/signup` — centered card, email + password, link to the other page. After success → `/`.
- Logout: "Keluar" button in the header (Server Action → `supabase.auth.signOut()` → redirect `/login`).

### Implementation
- **Server Actions** in `(auth)/actions.ts` (`login`, `signup`, `logout`), forms use React 19 `useActionState` for pending/error state. Validate with Zod on the server (email format, password ≥ 8 chars).
- Map Supabase `error.code` → Indonesian message (fallback to a generic one; never show raw English errors):

| `error.code` | Message |
|---|---|
| `invalid_credentials` | "Email atau password salah." |
| `user_already_exists` | "Email ini udah terdaftar. Coba masuk aja." |
| `weak_password` | "Password kurang kuat. Pakai minimal 8 karakter ya." |
| `over_request_rate_limit` | "Kebanyakan percobaan. Tunggu sebentar terus coba lagi." |
| *other* | "Ada yang error. Coba lagi ya." |

- If signup returns a user but no session (email confirmation on): show "Cek email kamu buat konfirmasi, abis itu masuk."
- **Route protection (defense in depth, all three layers):**
  1. `src/proxy.ts`: refresh session via `getClaims()`. Unauthenticated **page** requests → redirect `/login`. Authenticated requests to `/login`/`/signup` → redirect `/`. **Do not redirect `/api/*`** — those must return JSON `401`, not an HTML redirect. Matcher excludes `_next/static`, `_next/image`, favicon and image files.
  2. `app/page.tsx` (server component) re-checks `getClaims()` and redirects.
  3. Every API route calls `requireUser()` (§9).
- Autofill hints: `autoComplete="email"`, `"current-password"` (login), `"new-password"` (signup).

---

## 9. API contract

All endpoints: require auth · JSON only · `Cache-Control: no-store` · explicit selected columns · Zod validation · typed (no `any`) · Indonesian error messages · use the **user-scoped** Supabase client so RLS applies.

### 9.1 Shared plumbing
- `lib/api/auth.ts` → `requireUser(): Promise<{ supabase; userId }>`; calls `getClaims()`, throws `ApiError(401)` if absent.
- `lib/api/errors.ts` → `ApiError(status, code, message, fields?)` and a `handle(fn)` wrapper that converts `ApiError`/`ZodError`/unknown into the standard error body. Unknown errors → log server-side, return generic 500 (no internals leaked).
- Standard **error body**:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Datanya belum valid. Cek lagi isiannya ya.", "fields": { "amount": "Jumlah harus lebih dari 0" } } }
```

| HTTP | `code` | `message` (Indonesian) |
|---|---|---|
| 400 | `BAD_REQUEST` | "Request-nya nggak valid." (malformed JSON, bad query, bad UUID) |
| 401 | `UNAUTHORIZED` | "Kamu belum login. Masuk dulu ya." |
| 404 | `NOT_FOUND` | "Catatan nggak ditemukan." (also for other users' rows — never 403, never leak existence) |
| 422 | `VALIDATION_ERROR` | "Datanya belum valid. Cek lagi isiannya ya." + `fields` |
| 500 | `INTERNAL_ERROR` | "Ada masalah di server. Coba lagi sebentar lagi." |

### 9.2 `GET /api/debts`
Query (all optional, validated; invalid → 400): `status` (`all|unsettled|settled`, default `all`), `type` (`all|owed_to_me|i_owe`, default `all`), plus bonus params `q` (≤100 chars), `sort` (`date|amount`, default `date`), `order` (`asc|desc`, default `desc`).

- List query: filter `settled_at` is null / not null for `status`; `eq('type', …)`; `q` → `ilike('counterpart_name', '%escaped%')` (escape `%`, `_`, `\` in user input; **do not** use `.or()` with user strings). Order: `date` → `debt_date`, then `created_at`; `amount` → `amount`, then `created_at`. Limit to 500 rows (document as a trade-off).
- Summary: `supabase.rpc("debt_summary").single()` → `net = owed_to_me - i_owe`. **Independent of filters** (D2).
- `200`:
```json
{ "data": [ /* Debt[] */ ], "summary": { "owed_to_me": 1500000, "i_owe": 400000, "net": 1100000, "open_count": 3 } }
```

### 9.3 `POST /api/debts`
Body (`.strict()` — unknown keys such as `user_id` are rejected):
```json
{ "type": "owed_to_me", "counterpart_name": "Budi", "amount": 250000, "debt_date": "2026-10-06", "due_date": null, "note": "Patungan makan" }
```
- `debt_date` optional → defaults to today (WIB). `due_date`, `note` optional. `note` empty string → `null`.
- Server sets `user_id` from the session. `201` → `{ "data": Debt }`.

### 9.4 `PATCH /api/debts/[id]`
- `id` must be a UUID (else 400). Body: partial of the POST fields **plus** `settled?: boolean`; `.strict()`; at least one key required (else 422).
- `settled: true` → `settled_at = now()`; the DB trigger preserves the original timestamp if already settled ⇒ **idempotent**. `settled: false` → `settled_at = null`.
- Update with `.eq("id", id).select(DEBT_COLUMNS).maybeSingle()`; `null` → **404** (covers non-existent *and* other users' rows).
- `200` → `{ "data": Debt }`.

### 9.5 `DELETE /api/debts/[id]`
- UUID check → delete with `.eq("id", id).select("id").maybeSingle()`; `null` → 404. `200` → `{ "data": { "id": "…" } }`. A second delete of the same id → 404.

### 9.6 Validation schemas (`lib/validation/debt.ts`) — used by **both** the form and the API
Reference sketch (adapt to the installed Zod 4 API):
```ts
export const MAX_AMOUNT = 1_000_000_000_000;

const name   = z.string().trim().min(1, "Nama orang wajib diisi").max(100, "Nama maksimal 100 karakter");
const amount = z.number({ error: "Jumlah harus berupa angka" })
                .int("Jumlah harus bilangan bulat")
                .positive("Jumlah harus lebih dari 0")
                .max(MAX_AMOUNT, "Jumlahnya kegedean. Maksimal Rp 1.000.000.000.000");
const note   = z.string().trim().max(200, "Catatan maksimal 200 karakter")
                .transform((v) => (v === "" ? null : v)).nullable().optional();
const isoDate = z.iso.date("Format tanggal nggak valid");
```
Rules: `type ∈ {owed_to_me, i_owe}`; `due_date ≥ debt_date` when both present ("Jatuh tempo nggak boleh sebelum tanggal catat"). The form keeps `amount` as a string while typing and converts with `parseRupiahInput()` before validating with this same schema.

---

## 10. Domain logic (pure functions, unit-tested)

All business rules live in small pure functions under `src/lib/`, covered by Vitest. UI components must **only** call these — never format money or dates inline.

### 10.1 `formatRupiah(n: number): string` — `lib/format/rupiah.ts`
```ts
const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
export function formatRupiah(n: number): string {
  return `${n < 0 ? "-" : ""}Rp ${nf.format(Math.abs(n))}`;
}
```
Why not `style: "currency"`: its output contains a non-breaking space and varies by ICU version; building `"Rp " + number` is deterministic. Sign goes **before** "Rp".

| Input | Output |
|---|---|
| `0` | `Rp 0` |
| `1000` | `Rp 1.000` |
| `1234000` | `Rp 1.234.000` |
| `1000000000` | `Rp 1.000.000.000` |
| `-500000` | `-Rp 500.000` |

`parseRupiahInput(raw: string): number | null` — strips every non-digit; empty → `null`.
`"1.234.000"→1234000`, `"Rp 5.000"→5000`, `"0012"→12`, `""→null`, `"abc"→null`.
`formatRupiahInput(digits)` re-inserts dots while typing (keep the caret usable on mobile).

### 10.2 `formatRelativeDay(isoDate, now = new Date()): string` — `lib/format/relative-date.ts`
Input is a `YYYY-MM-DD` **date** (no time). Compare **calendar days in `Asia/Jakarta`**, not 24-hour windows. Get "today in WIB" via `new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now)`; diff with `Date.UTC(...)`.

| days ago (`d`) | Output |
|---|---|
| `0` | `hari ini` |
| `1` | `kemarin` |
| `2–6` | `{d} hari lalu` |
| `7–29` | `{floor(d/7)} minggu lalu` |
| `30–364` | `{floor(d/30)} bulan lalu` |
| `≥ 365` | `{floor(d/365)} tahun lalu` |
| `-1` | `besok` |
| `≤ -2` | `{abs(d)} hari lagi` |

Test cases with `now = 2026-10-06` (WIB): `2026-10-06→hari ini` · `10-05→kemarin` · `10-03→3 hari lalu` · `09-29→1 minggu lalu` · `09-07→4 minggu lalu` · `09-06→1 bulan lalu` · `2026-07-08→3 bulan lalu` · `2025-10-06→1 tahun lalu` · `10-07→besok` · `10-09→3 hari lagi`.
**Timezone edge test:** `now = 2026-10-05T18:30:00Z` (that is 01:30 on 6 Oct in WIB) and date `2026-10-06` → `hari ini` (a naive UTC implementation returns "besok").

Also export `todayInJakarta(now?)` (`YYYY-MM-DD`) and `formatAbsoluteDate(iso)` (`Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })`, shown as a `title`/tooltip next to the relative text).

### 10.3 Net — `lib/debts/summary.ts`
`computeNet(owedToMe, iOwe) = owedToMe - iOwe`. Tests: `(1_500_000, 400_000) → 1_100_000` · `(0, 500_000) → -500_000` · `(0, 0) → 0`.
Net color: `net >= 0` → green, `net < 0` → red. Also show a sign/icon (`+`/`−`, `TrendingUp`/`TrendingDown`) so color is never the only signal.

### 10.4 Filters — `lib/debts/filters.ts`
`parseDebtFilters(searchParams)` → typed `DebtFilters`, falling back to defaults on invalid values (UI) — the **API** rejects invalid values with 400 instead. Same Zod enums are reused.

### 10.5 Group by person (bonus) — `lib/debts/group.ts`
`groupByCounterpart(debts)` → groups by normalized name (`trim`, collapse spaces, lowercase) so `"Budi"`, `" budi "`, `"BUDI"` collapse into one group. Per group: display name (first-seen casing), entry count, open `owed_to_me` total, open `i_owe` total, net.

---

## 11. UI/UX specification

### 11.1 Principles
Mobile-first (design at 375px, enhance at `sm`/`md`). One clear hierarchy: **Net → totals → list → actions**. Money is the hero: large, tabular-nums, consistent. Every async thing has a loading, success, and error state. Casual, friendly Indonesian copy, centralized in `lib/copy.ts`.

### 11.2 Design tokens (Tailwind v4 `@theme` in `globals.css`)
- **Semantic color:** money coming in (`owed_to_me`) = emerald; money going out (`i_owe`) = rose. Brand accent for primary buttons/focus = indigo (kept distinct from the green/red money semantics). Neutrals = slate/zinc. Muted background `slate-50`, surfaces white with `border-slate-200`; shadow only on elements that actually float (FAB, modal, toast).
- **Font:** `next/font/google` → *Plus Jakarta Sans* (latin) wired to `--font-sans`; numbers use `tabular-nums`.
- **Shape/spacing:** radius encodes hierarchy, max 3 values (e.g. Net hero card `rounded-2xl`, inputs/buttons `rounded-xl`, badges `rounded-full`); max 2 elevation levels; 4px spacing scale; page container `mx-auto max-w-3xl px-4 pb-28 pt-6`. Details in §11.10.
- **Touch targets** ≥ 44×44px. Respect `prefers-reduced-motion`. Use `100dvh` (not `100vh`) for full-height on phones.

### 11.3 Screens

**Auth (`/login`, `/signup`)** — logo + one-line tagline, card with email + password (show/hide toggle with `Eye`/`EyeOff`), primary submit button with spinner while pending, inline error banner, link to the other page.

**Dashboard (`/`)**
1. **Header:** app name "Kasbon" (+ `Wallet` icon), user email (hidden on very small screens), "Keluar" button (`LogOut` icon).
2. **Summary cards (3):**
   - Mobile: **Net** is a full-width hero card on top; the two totals sit side-by-side below (2-col grid, use `order-*`). ≥ `sm`: three equal columns in the brief's order (Dihutang ke saya · Saya hutang · Net).
   - Each card: label, big Rupiah value, small subtext (e.g. "3 catatan belum lunas"). Net card tinted green/red with sign + trend icon.
   - Skeleton while loading; error → inline retry.
3. **Toolbar:** status `Select` + type `Select` (side by side), then (bonus) search input and sort select. A "Reset filter" text button appears when any filter is active. Filters sync to the URL (`?status=…&type=…&q=…`), defaults omitted.
4. **Entry list** (cards, not a table — better on phones). See 11.4.
5. **"+ Catat baru":** fixed floating button (bottom-right, `Plus`, safe-area aware) on mobile; inline button in the toolbar on ≥ `sm`. Opens the form modal.

### 11.4 Entry card (`DebtItem`)
- **Container:** all rows share one surface separated by hairline dividers (no separate floating shadowed card per row).
- **Row 1:** initial-letter avatar · **name** (semibold, truncate) · **amount** right-aligned, colored by type with `+`/`−` prefix (`+Rp 250.000` emerald for owed_to_me, `−Rp 250.000` rose for i_owe).
- **Row 2 (meta; separate elements with `gap`, never a `·`-joined string):** type badge with icon (`ArrowDownLeft` "Dihutang ke saya" / `ArrowUpRight` "Saya hutang") · relative date (`title` = absolute date) · status badge (`Belum lunas` amber / `Lunas` slate with `CheckCircle2`). If `due_date` is past and still unsettled → small red "Lewat jatuh tempo" chip.
- **Row 3:** note, single line, truncated (full text in `title`).
- **Row 4 (actions):** primary **"Tandai lunas"** button (`Check`) — becomes **"Batal lunas"** (ghost, `Undo2`) when settled; icon buttons **Edit** (`Pencil`) and **Hapus** (`Trash2`) with `aria-label`s.
- **Settled rows:** muted (reduced opacity), amount `line-through`.
- Pending mutation on a row → its buttons disabled + small spinner.
- Delete **always** opens a `ConfirmDialog` (never `window.confirm`).

### 11.5 Form modal (create & edit — one component)
- Native `<dialog>` (`showModal()`): focus trap + ESC for free. **Mobile = bottom sheet** (`rounded-t-3xl`, `max-h-[90dvh]`, scrollable body, sticky footer buttons); **≥ `sm` = centered** `max-w-md`. Backdrop click closes.
- Title: "Catat baru" / "Edit catatan".
- Fields in order: **Tipe** (two big radio-cards: "Saya dihutang" `ArrowDownLeft` emerald · "Saya hutang" `ArrowUpRight` rose; default: dihutang) → **Nama orang** (autofocus, `autoComplete="off"`) → **Jumlah** (prefix "Rp", live thousand separators, `inputMode="numeric"`) → **Tanggal** (`type="date"`, default `todayInJakarta()`) → **Jatuh tempo** (optional, `type="date"`, tucked behind a "+ Tambah jatuh tempo" toggle) → **Catatan** (textarea, live counter `0/200`, turns red near the limit).
- Validation: on blur + on submit using the shared Zod schema; inline messages under each field; the first invalid field is focused. Server `422` `fields` are mapped back to the same inline slots. Submit button shows a spinner and is disabled while pending (no double submit). Success → close modal, toast, list refreshes.

### 11.6 States (all required)
| State | Behavior |
|---|---|
| Loading | Skeleton cards (3 summary + 4 list rows). No layout jump. |
| Empty (no entries at all) | `Inbox` icon, "Belum ada catatan", helper text, primary CTA "+ Catat yang pertama". |
| Empty (filters match nothing) | "Nggak ada yang cocok sama filter-nya" + "Reset filter" button. |
| Error (fetch failed) | `AlertCircle`, friendly message, "Coba lagi" button (refetch). |
| Mutation error | Toast with Indonesian message; optimistic change rolled back. |
| 401 from API | Redirect to `/login`. |
| Route-level | `error.tsx` and `not-found.tsx` with friendly copy and a way home. |

### 11.7 Micro-interactions (keep subtle, ≤ 200ms)
- "Tandai lunas": **optimistic** update (badge flips immediately, row dims) → on error roll back + toast. If the active filter is "Belum lunas", the row fades out of the list.
- Button press feedback (`active:scale-[0.98]`), focus rings (`focus-visible`), skeleton shimmer, modal slide-up on mobile / fade-scale on desktop, number cards subtly update when totals change.
- Everything animated honors `prefers-reduced-motion`.

### 11.8 Copy deck (`lib/copy.ts`) — casual Indonesian
| Key | Text |
|---|---|
| App tagline | "Catat utang-piutang, biar nggak lupa siapa yang belum bayar." |
| Login title / CTA | "Masuk" / "Masuk" · link: "Belum punya akun? Daftar dulu" |
| Signup title / CTA | "Bikin akun" / "Daftar" · link: "Udah punya akun? Masuk" |
| Logout | "Keluar" |
| Cards | "Total dihutang ke saya" · "Total saya hutang" · "Net" |
| Card subtext | "{n} catatan belum lunas" · net ≥ 0: "Lebih banyak yang harus dibayar ke kamu" · net < 0: "Kamu lebih banyak hutangnya" |
| Type labels | "Dihutang ke saya" · "Saya hutang" · (form radios) "Saya dihutang" · "Saya hutang" |
| Status | "Belum lunas" · "Lunas" |
| Filters | "Semua status" · "Semua tipe" · "Reset filter" · search placeholder "Cari nama orang…" |
| Actions | "+ Catat baru" · "Tandai lunas" · "Batal lunas" · "Edit" · "Hapus" · "Simpan" · "Batal" |
| Form labels | "Tipe" · "Nama orang" (placeholder "Mis. Budi") · "Jumlah" · "Tanggal" · "Jatuh tempo (opsional)" · "Catatan (opsional)" (placeholder "Mis. Patungan makan malam") |
| Validation | "Nama orang wajib diisi" · "Jumlah harus lebih dari 0" · "Catatan maksimal 200 karakter" |
| Delete dialog | "Hapus catatan ini?" / "Catatan {nama} sebesar {Rp} bakal dihapus permanen." |
| Toasts | "Catatan tersimpan" · "Udah ditandai lunas" · "Status lunas dibatalin" · "Catatan dihapus" · "Gagal nyimpen. Cek koneksimu, lalu coba lagi." |
| Empty | "Belum ada catatan" / "Mulai catat utang-piutangmu di sini." |
| Fetch error | "Gagal ngambil data. Cek koneksimu, lalu coba lagi." / "Coba lagi" |

### 11.9 Accessibility
`<html lang="id">`; every input has a visible `<label>`; icon-only buttons have `aria-label`; toasts in an `aria-live="polite"` region; status never conveyed by color alone; visible focus states; modal restores focus to the trigger on close; contrast ≥ WCAG AA.

### 11.10 Anti-slop design rules

Kasbon should look like a product built for one specific job (checking who owes whom, on a phone), not like a template. Where §11 pins something down, follow it. Where §11 leaves an axis open, do **not** fill it with the generic defaults below. This section wins over §11.2 / §11.4 if they conflict.

**A. Design plan first (Phase 5, step 0).** Before writing UI code, create `docs/DESIGN.md` (max 1 page): palette (4–6 named hex values), type roles and scale, spacing/radius/elevation scale, ASCII wireframes of the dashboard at 375px and 1280px, and 3–5 design principles. Then review it: any part that reads like what you'd produce for *any* finance dashboard gets revised, and you note what you changed and why. If you have a `frontend-design` skill, read it first.

**B. Banned patterns (do not ship any of these)**
| Pattern | Do this instead |
|---|---|
| Gradient washes as decoration, gradient text/buttons, glassmorphism, blurred blobs, glowing shadows | Flat surfaces; color only where it carries meaning (money in/out, status) |
| The identical-card kit: every block a same-radius, same-shadow rounded card | Hierarchy through size, tint and spacing. The **Net** card is visibly different; list rows share one surface with dividers |
| An icon inside a tinted rounded square above every card | Icons only where they aid recognition (type, status, actions) |
| Emoji used as icons or decoration | Lucide icons only |
| Tracked-out ALL-CAPS eyebrow labels, "WORD — fragment" labels, `→` appended to buttons/links, labels that add nothing | Sentence case; a label only if it helps the user understand |
| Meta strings glued with middle dots ("Dihutang · 3 hari lalu · Belum lunas") | Separate elements (icon + text, badges) with `gap` |
| One word of a headline accented by color/italic | Plain, consistent headings |
| Numbered markers (01 / 02 / 03) | Only for real sequences (none here) |
| Monospace font for small data labels | The single sans family with `tabular-nums` for money |
| Fade-and-slide-up on every section, hover lift on every card, scattered ambient animation | Motion only answers a user action (§11.7); at most one calm load moment (skeleton → content) |
| Stock hero images, decorative illustrations, lorem ipsum, fake/sample data | Real empty states; no placeholder content |
| Reflexive default look: near-black + neon accent, or cream + terracotta + serif display | The palette in §11.2 (slate/white, indigo accent, emerald/rose for money) |

**C. Spend boldness in one place.** The memorable element is the money: the **Net** hero card and the amount typography. Everything around it stays quiet. Before every UI commit, remove one decoration that doesn't serve the user.

**D. Typography.** One family. Define the scale as tokens (max 4 sizes, 2–3 weights). Money uses `tabular-nums`. Body line length < 80 characters (`max-w-prose` for notes). Sentence case everywhere, no all-caps.

**E. Tokens only.** Every color, spacing, radius, shadow and font size comes from the `@theme` tokens in `globals.css`. No arbitrary values (`w-[137px]`, `#3a7bd5`, `text-[13px]`) in components unless there is a one-line comment explaining why. Changing the look should mean editing one file.

**F. Copy rules (casual Indonesian, but functional).**
- A button says exactly what happens, and the action keeps the same verb through the whole flow ("Tandai lunas" → toast "Udah ditandai lunas").
- Errors say what went wrong and how to fix it. They don't apologize or add mood.
- Empty states invite an action ("Mulai catat utang-piutangmu di sini" + button).
- No marketing filler ("kelola keuanganmu dengan mudah dan seamless"), no exclamation spam, no emoji.

**G. Quality floor and visual QA.** Responsive at 375 / 768 / 1280px, no horizontal scroll, visible `focus-visible`, `prefers-reduced-motion` respected, WCAG AA contrast. Before each UI commit, if your environment can run a browser (Playwright, Chrome, a preview tool), take screenshots at 375px and 1280px and check spacing, hierarchy and overflow. If you cannot, say so plainly and ask the owner to review. **Never claim a visual check you did not do.**

---

## 12. Data layer & hooks

- `providers.tsx`: single `QueryClient` (`staleTime` ~15s, `retry: 1`, no refetch-on-focus storms).
- `lib/api/client.ts`: `apiFetch<T>(url, init): Promise<T>` — sets JSON headers, parses the standard error body and throws a typed `ApiClientError { status, code, message, fields? }`. Never returns `any`; response types come from `types/debt.ts`.
- Query key: `["debts", filters]`. All mutations `invalidateQueries({ queryKey: ["debts"] })` on settle (so cards and list stay consistent).
- Hooks (one responsibility each): `useDebts(filters)`, `useCreateDebt()`, `useUpdateDebt()`, `useToggleSettled()` (optimistic: `onMutate` cancel + snapshot + patch cache, `onError` rollback, `onSettled` invalidate), `useDeleteDebt()`, `useDebtFilters()` (URL ⇄ state via `useSearchParams` + `router.replace(..., { scroll: false })`), `useDebouncedValue(value, 300)` for search.
- `app/page.tsx` is a **server component** that verifies the session, then renders `<DashboardClient />` (wrapped in `<Suspense>` because it reads search params).

---

## 13. Scope & priorities

| Priority | Item |
|---|---|
| **P0 (required)** | Everything in §1–§12 not marked bonus: auth, RLS, API (4 endpoints), dashboard cards, list, filters, form modal (create/edit), mark lunas, delete, Rupiah + relative date, Indonesian copy, README, deploy |
| **P1 (cheap bonus, do all)** | Loading / empty / error states everywhere (already in §11.6) · search by name · sort by amount/date · mobile-first polish · optimistic updates · overdue chip |
| **P2 (only if P0+P1 are solid and committed)** | Group by person ("Budi · 3 catatan · Rp X") as a "Per orang" view toggle · bar chart "Dihutang vs Hutang" (plain `div`/SVG bars, `aria-label` with values, no chart lib) |

Never ship a half-finished bonus. If it isn't done and tested, remove it.

---

## 14. Build plan (phases, commits, definition of done)

Run the 4 checks (`typecheck`, `lint`, `test`, `build`) before every commit. Suggested commit messages are in *italics*.

### Phase 0 — Scaffold
- `npx create-next-app@latest kasbon --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`. Confirm `next@16` and `tailwindcss@4` in `package.json`.
- Install: `@supabase/supabase-js @supabase/ssr zod lucide-react @tanstack/react-query` and dev `vitest`. Add scripts: `typecheck`, `lint` (`eslint .`), `test` (`vitest run`). Configure Vitest with the `@` → `src` alias.
- `tsconfig`: `"strict": true` (+ `"noUncheckedIndexedAccess": true`). ESLint: `@typescript-eslint/no-explicit-any: "error"`.
- `.env.example` (placeholders only), `.gitignore` covers `.env*.local`, `lib/env.ts` (Zod).
- Replace boilerplate page; set `lang="id"`, font, metadata.
- *Commits:* `chore: scaffold Next.js 16 + Tailwind v4 project` · `chore: strict TypeScript, eslint, vitest, env validation`

### Phase 1 — Database & RLS
- Write the migration (§6) and `scripts/rls-check.sh` (§7). Hand-write or generate `database.types.ts`.
- **HUMAN:** create Supabase project, run migration, create users A & B (§17).
- *DoD:* `rls-check.sh` passes against the real project.
- *Commits:* `feat(db): create debts table, trigger, summary fn and strict RLS` · `test(db): add curl-based RLS leak check`

### Phase 2 — Supabase clients, proxy, auth
- `lib/supabase/{client,server,proxy}.ts`, `src/proxy.ts`, `(auth)` pages + server actions, Header with logout.
- *DoD:* signup → lands on `/`; logout → `/login`; visiting `/` logged out → `/login`; `/api/debts` logged out → JSON 401.
- *Commits:* `feat(auth): supabase ssr clients and proxy session refresh` · `feat(auth): login, signup and logout with Indonesian errors`

### Phase 3 — Domain logic + validation (tests first)
- `formatRupiah`, `parseRupiahInput`, `formatRelativeDay`, `todayInJakarta`, `computeNet`, `parseDebtFilters`, Zod schemas — with the exact test cases from §10.
- *Commits:* `feat(lib): rupiah and relative-date formatting with tests` · `feat(lib): shared zod schemas and net calculation with tests`

### Phase 4 — API
- `requireUser`, `ApiError`/`handle`, `GET/POST /api/debts`, `PATCH/DELETE /api/debts/[id]`.
- *DoD:* manually exercise every status code in §9.1 with `curl` (include a session cookie or use the UI + browser devtools); settle twice → same `settled_at`; other user's id → 404.
- *Commits:* `feat(api): list and create debts with validation` · `feat(api): update, settle and delete debts`

### Phase 5 — UI (P0)
- **Step 0:** write `docs/DESIGN.md` per §11.10-A and review it. Then: UI primitives → `DashboardClient` (cards, list, filters) → form modal → settle/delete flows → states.
- *DoD:* §11.10 banned-pattern table has zero hits; no arbitrary values in components; screenshots at 375px and 1280px reviewed (or the owner is told they were not possible).
- *Commits (examples):* `docs: add design plan for dashboard` · `feat(ui): base components and design tokens` · `feat(dashboard): summary cards and debt list` · `feat(dashboard): status and type filters synced to URL` · `feat(debts): create and edit form modal with shared validation` · `feat(debts): optimistic mark-lunas and delete confirmation` · `feat(ui): loading, empty and error states`

### Phase 6 — P1 then P2 bonuses
- Search, sort, overdue chip, polish; then group-by-person and bar chart if time allows.
- *Commits:* `feat(dashboard): search and sort` · `feat(dashboard): group by person view` · `feat(dashboard): dihutang vs hutang bar chart`

### Phase 7 — Docs & deploy
- **7a (do this early, right after Phase 4):** push to GitHub, deploy to Vercel, add the 2 env vars, smoke-test on the live URL. A broken deploy is an auto-reject — find out on day 1, not the last hour.
- **7b:** README (§16), `docs/WALKTHROUGH.md` (per-file explanation: purpose, key functions, the "why"; plus answers to §18's questions), final QA (§15).
- *Commits:* `docs: readme with setup, approach, trade-offs` · `docs: add code walkthrough for interview prep`

---

## 15. Final QA & Definition of Done

**Automated:** `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run test` ✅ · `npm run build` ✅ · `scripts/rls-check.sh` ✅ · `grep -rnE ":\s*any\b|as any|<any>" src` → empty ✅

**Manual (on the live Vercel URL, on a phone-size viewport and desktop):**
- [ ] Sign up with a brand-new email → empty state (no sample data).
- [ ] Create one `owed_to_me` (Rp 1.234.000) and one `i_owe`; cards show correct totals; Net color correct (green ≥ 0, red < 0).
- [ ] Amounts render exactly like `Rp 1.234.000` everywhere (cards, list, form preview, delete dialog, chart).
- [ ] Relative dates: today → "hari ini"; yesterday → "kemarin"; older → "N hari lalu".
- [ ] Filters (status × type) change the list but **not** the summary cards; URL updates; refresh keeps filters.
- [ ] "Tandai lunas" → **hard refresh** → still lunas; tap again → no change (idempotent); "Batal lunas" works; totals update.
- [ ] Edit prefills all fields; save updates the row; validation errors show inline (client) and the same errors come back from the API (`curl` with bad body → 422 in Indonesian).
- [ ] Delete asks for confirmation; deleted row gone after refresh.
- [ ] Logged out: `/` → `/login`; `/api/debts` → 401 JSON.
- [ ] User B cannot see/edit/delete user A's rows through the UI **or** the REST API.
- [ ] Loading skeletons, empty state, filter-empty state and error state (simulate by going offline) all look right.
- [ ] No console errors; no unhandled promise rejections; Lighthouse accessibility ≥ 90.
- [ ] §11.10 check: no gradients/emoji/ALL-CAPS eyebrows/middle-dot meta strings/identical card kit; `docs/DESIGN.md` exists.

---

## 16. README template (agent drafts everything except `TODO(owner)`)

```md
# Kasbon — catat utang-piutang

> Web app sederhana buat nyatet siapa hutang ke kamu dan kamu hutang ke siapa.

**Demo:** TODO(owner): https://<your-app>.vercel.app
**Loom:** TODO(owner)

## Fitur
(bullets short: auth, dashboard, filter, CRUD, tandai lunas, bonus yang selesai)

## Stack
Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + Auth) · Lucide React

### Library tambahan & alasannya
| Library | Kenapa |
|---|---|
| zod | satu skema validasi dipakai di form (client) dan API (server) |
| @tanstack/react-query | cache, loading/error state, optimistic update buat "Tandai lunas" |
| vitest | unit test buat logic bisnis (Rupiah, tanggal relatif, net) |

## Setup lokal
1. Prasyarat: Node ≥ 20.9, akun Supabase (free tier).
2. `git clone … && cd kasbon && npm install`
3. `cp .env.example .env.local` lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Migrasi database: jalankan `supabase/migrations/20261006000000_create_debts.sql` di Supabase SQL Editor (atau `supabase link` + `supabase db push`).
5. Supabase → Authentication → Providers → Email: matiin "Confirm email" (biar bisa langsung dicoba).
6. `npm run dev` → http://localhost:3000
Scripts: `dev`, `build`, `typecheck`, `lint`, `test`.

## Struktur singkat
(tree of src/ with one-line purposes)

## API
(table of 4 endpoints: params, body, success/error codes — copy from PRD §9)

## Bukti RLS tidak bocor
How to run `scripts/rls-check.sh` + TODO(owner): paste real output.

## Keputusan teknis (Approach)
TODO(owner): 1 paragraf, pakai kata-katamu sendiri. Kandidat: RLS-first (DB yang jagain data, API pakai
client milik user), settle idempotent via trigger, 1 skema Zod buat client+server, `debt_date` kolom tambahan (D1).

## Trade-off: kalau ada 1 hari lagi
TODO(owner): pilih yang kamu beneran bakal polish. Kandidat: integration test API + Playwright e2e,
pagination/infinite scroll (sekarang limit 500), summary update optimistic, dark mode, export CSV.

## Time spent
TODO(owner): jujur. (mis. "± X jam: DB+RLS Y jam, API Y jam, UI Y jam, polish/deploy Y jam")
```

---

## 17. Human-only tasks (the agent must stop and ask for these)

1. **Create a Supabase project** (free tier). Collect *Project URL* and *Publishable key* (Settings → API Keys). **Do not** share the secret/service_role key with the agent or commit it.
2. **Run the migration** (SQL Editor → paste the file, or `supabase link` + `supabase db push`).
3. **Auth settings:** Authentication → Sign In / Providers → Email → turn **off** "Confirm email". After deploying, add the Vercel URL under Authentication → URL Configuration (Site URL + Redirect URLs).
4. **Create two test accounts** (A and B) via the app's signup page for `rls-check.sh`.
5. **Fill `.env.local`** locally; later add the same two variables in Vercel → Project → Settings → Environment Variables.
6. *(Optional)* run `supabase gen types typescript …` and commit `database.types.ts`.
7. **GitHub:** create a **public** repo, push (commit history must be intact — no squash).
8. **Vercel:** import the repo (free tier), set env vars, deploy, smoke-test the live URL (§15).
9. **Keep the demo alive:** free-tier Supabase projects can be paused after inactivity. Open the live demo right before submitting (and again if review is days away) to make sure it still loads.
10. **Write your own** README "Approach", "Trade-off", and an honest "Time spent". Add the demo + Loom links.
11. **Study** `docs/WALKTHROUGH.md` until you can explain every file without reading it. Record the Loom (≤ 3 min): demo (1m) + one decision you're proud of (1m) + one thing still lacking (1m).
12. Send the repo, Vercel and Loom links to the recruiter.

---

## 18. Loom & interview prep (for the owner)

**Loom outline (≤ 3:00)**
- **0:00–1:00 Demo:** signup → empty state → create two entries → cards/Net → filters → *Tandai lunas* → hard refresh (still lunas) → edit → delete → phone viewport → show `rls-check.sh` output.
- **1:00–2:00 Proud decision:** RLS-first design — the database enforces ownership, the API uses the user's own session (never a service key), `settled_at` is idempotent in a DB trigger, and one Zod schema validates both client and server.
- **2:00–3:00 What's lacking:** be specific and calm (e.g. no API integration tests, list capped at 500 rows without pagination). Naming gaps = strength, not weakness. Don't be defensive.

**Questions you should be able to answer cold**
1. Why `(select auth.uid())` in policies instead of `auth.uid()`? *(evaluated once per statement, not per row)*
2. Why does a foreign user's id return **404** rather than 403? *(don't reveal existence)*
3. `getClaims()` vs `getSession()` on the server? *(signature-verified vs. untrusted cookie)*
4. Why `bigint` and integer Rupiah, and why cap at 1 trillion? *(no float errors; stays under JS's safe-integer limit)*
5. Why an extra `debt_date` column? *(D1)* · Why is the summary an RPC? *(1000-row cap, one round trip, RLS still applies via security invoker)*
6. What does `proxy.ts` do, and why doesn't it redirect `/api/*`? *(Next 16 rename of middleware; APIs need JSON 401)*
7. What happens if two tabs mark the same debt lunas? *(trigger keeps the first `settled_at`)*
8. How does the optimistic update roll back? *(snapshot in `onMutate`, restore in `onError`)*
9. Why `Intl` and a custom relative formatter instead of date-fns or `Intl.RelativeTimeFormat`? *(brief wants "3 hari lalu"; native Intl gives "3 hari yang lalu"; calendar-day logic in WIB)*
10. How would you add pagination, tests for the API, or partial payments?

---

## Appendix A — Kickoff prompt to paste to the AI agent

```text
You are building the "Kasbon" hiring-task app. The attached KASBON_PRD.md is the single source of truth
(the original brief PDF is attached for reference only; where they differ, the PRD's §3 decisions win).

Rules: follow §0 exactly. Work phase by phase (§14). Before each commit run typecheck, lint, test, build.
Use Next.js 16 conventions (proxy.ts, async params, no `next lint`) and Supabase getClaims().
No `any`. No service_role key. No mock data. Don't invent README facts — leave TODO(owner).

For all UI work follow §11.10 (anti-slop design): write docs/DESIGN.md first, read the frontend-design skill if you
have it, and screenshot-check at 375px and 1280px if you can run a browser. If you can't, say so; don't claim you checked.

Start with Phase 0 and Phase 1. When you reach anything in §17 that needs me (Supabase project, keys,
Vercel, Loom), stop and tell me exactly what you need. After each phase, give me a 3-line summary:
what you built, what you verified, what's next.
```
