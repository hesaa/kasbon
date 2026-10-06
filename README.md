# Kasbon — Catat Utang-Piutang

> Web app sederhana, cepat, dan transparan buat nyatet siapa hutang ke kamu dan kamu hutang ke siapa.

**Demo:** TODO(owner): https://<your-app>.vercel.app
**Loom:** TODO(owner)

---

## Fitur Utama

- **Authentication:** Sign up & Login dengan email + password (Supabase Auth).
- **Summary Cards:** Total dihutang ke saya (piutang), Total saya hutang (utang), Net balance, dan jumlah utang belum lunas.
- **Daftar Utang Mobile-First:** Tabular view dengan badges status, tanggal utang (`debt_date`), tanggal jatuh tempo (`due_date`), dan catatan (`note`).
- **Filter & Search:** Filter berdasarkan Status (*Semua / Belum lunas / Lunas*), Tipe (*Semua / Dihutang ke saya / Saya hutang*), pencarian nama lawan transaksi, serta pengurutan berdasarkan nominal atau tanggal.
- **View Switcher:** Pilihan tampilan **Daftar (List)**, **Per Orang (Grouped Counterpart)**, dan **Grafik Bar (Chart)** perbandingan utang vs piutang.
- **Form Modal:** Tambah & edit utang dengan format otomatis ribuan (Rupiah) secara real-time.
- **Idempotent Settlement:** "Tandai lunas" / "Batal lunas" persisted server-side dengan DB trigger `debts_before_update`.
- **Delete Confirmation:** Dialog konfirmasi sebelum menghapus catatan.
- **Strict Row Level Security (RLS):** Data diawasi ketat di level PostgreSQL — user A tidak akan pernah bisa membaca, mengubah, atau menghapus data user B.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode: `no-explicit-any`, `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS v4 (Anti-Slop design tokens, tabular-nums, mobile-first)
- **Database & Auth:** Supabase (Postgres + Supabase Auth `@supabase/ssr`)
- **Icons:** Lucide React

### Library Tambahan & Alasannya

| Library | Kegunaan |
|---|---|
| `zod` | Skema validasi tunggal untuk Form UI (client) dan Rest API Route (server). |
| `@tanstack/react-query` | Caching, query key user isolation (`["debts", userEmail, filters]`), loading/error state management, dan automatic cache invalidation. |
| `vitest` | Unit testing untuk fungsi murni logic bisnis (Rupiah, WIB date, Zod schemas, filter & group, net balance). |
| `sonner` | Notification toast instan saat menyimpan, mengubah status lunas, & menghapus data. |

---

## Setup Lokal & Development

1. **Prasyarat:** Node.js ≥ 20.9, akun Supabase (Free tier).
2. **Clone & Install:**
   ```bash
   git clone <repo-url>
   cd kasbon
   npm install
   ```
3. **Environment Variables:**
   Salin `.env.example` ke `.env.local` dan isi URL & Key Supabase kamu:
   ```bash
   cp .env.example .env.local
   ```
   Isi variabel berikut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
   ```
4. **Migrasi Database:**
   Jalankan file SQL migrasi di Supabase Dashboard (SQL Editor):
   ```bash
   supabase/migrations/20261006000000_create_debts.sql
   ```
5. **Konfigurasi Auth Supabase:**
   Di Supabase Dashboard → *Authentication* → *Providers* → *Email*, matikan pilihan **"Confirm email"** agar user baru langsung terverifikasi saat Sign Up.
6. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Command Scripts

| Script | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan local development server Next.js 16. |
| `npm run build` | Menjalankan production build & typecheck Turbopack. |
| `npm run typecheck` | Menjalankan verifikasi TypeScript strict (`tsc --noEmit`). |
| `npm run lint` | Menjalankan ESLint code checks. |
| `npm run test` | Menjalankan 15 unit test Vitest untuk logic bisnis. |
| `npm run seed` | Mengisi database Supabase dengan 4 akun demo & 22 transaksi sampel. |
| `npm run db:reset` | Menghapus seluruh data transaksi utang milik akun demo (idempotent). |
| `npx tsx scripts/rls-check.ts` | Menjalankan 12 pengujian kebocoran keamanan Row Level Security (RLS). |

---

## Struktur Folder Project

```
kasbon/
├─ supabase/migrations/     # Database migration & strict RLS policies
├─ scripts/                 # RLS leak check & database seed / reset tooling
│  ├─ load-env.ts           # Helper pemuat environment variables
│  ├─ seed-data.ts          # Single source of truth data sampel akun & utang
│  ├─ seed.ts               # Seeder database Supabase multi-user
│  ├─ reset.ts              # Script pembersih / reset data transaksi utang
│  ├─ rls-check.ts          # Verifikasi kebocoran RLS cross-platform Node/TS
│  └─ rls-check.sh          # Verifikasi kebocoran RLS via bash + curl + jq
├─ docs/                    # Dokumentasi DESIGN.md & WALKTHROUGH.md
├─ src/
│  ├─ proxy.ts              # Next.js 16 session refresh & Auth protection proxy
│  ├─ app/                  # App Router pages (/login, /signup) & API routes (/api/debts)
│  ├─ components/           # UI primitives & dashboard components (List, Group, Chart, Form)
│  ├─ hooks/                # React Query hooks (`useDebts`, `useCreateDebt`, `useDebtFilters`, dll)
│  ├─ lib/                  # Formatters, Zod schemas, Supabase clients (`server`, `client`, `proxy`)
│  └─ types/                # Database schemas & DTO TypeScript interfaces
```

---

## API Contract (`/api/debts`)

Semua REST API endpoint terlindungi autentikasi cookie Supabase. Response yang dikembalikan menggunakan format JSON standar:

| Method | Endpoint | Query / Body | Response & Status |
|---|---|---|---|
| **GET** | `/api/debts` | `status` (`all\|unsettled\|settled`), `type` (`all\|owed_to_me\|i_owe`), `q`, `sort` (`date\|amount`), `order` (`asc\|desc`) | `200 OK` `{ data: Debt[], summary: DebtSummary }` |
| **POST** | `/api/debts` | `{ type, counterpart_name, amount, debt_date, due_date?, note? }` | `201 Created` `{ data: Debt }` |
| **PATCH** | `/api/debts/[id]` | Partial body / `{ settled?: boolean }` | `200 OK` `{ data: Debt }` (404 jika bukan milik caller) |
| **DELETE** | `/api/debts/[id]` | - | `200 OK` `{ data: { id: string } }` (404 jika bukan milik caller) |

---

## Bukti Kebocoran Security (RLS Check)

Jalankan pengujian kebocoran Row Level Security (RLS) via terminal:

```bash
npx tsx scripts/rls-check.ts
```

Output pengujian RLS (12/12 check lulus):

```text
🔍 Starting Kasbon RLS Leak Verification against https://cibdcojczrynwwddsvxo.supabase.co...
✅ Check 1: Authenticated User A (463c308c-2a2e-40fd-adb2-01df35ff76ad)
✅ Check 2: Authenticated User B (b45944f4-2633-4fa1-9be4-4131c445971a)
✅ Check 3: User A created debt row (d230029e-f9fa-4295-8a75-75cfc10d3cf0)
✅ Check 4: User B cannot read User A's row by ID (returned [])
✅ Check 5: User B listing debts contains none of User A's rows
✅ Check 6: User B cannot PATCH User A's row (amount unchanged at 100000)
✅ Check 7: User B cannot DELETE User A's row (row still exists)
✅ Check 8: User B inserting with User A's user_id is rejected by RLS WITH CHECK
✅ Check 9: User B cannot reassign row ownership to User A
✅ Check 10: Anonymous request to /rest/v1/debts is rejected (401)
✅ Check 11: RPC debt_summary returns only authenticated caller's totals
✅ Check 12: User A successfully cleaned up test row
🎉 ALL 12 RLS CHECKS PASSED SUCCESSFULLY!
```

---

## Keputusan Teknis (Approach)

TODO(owner): 1 paragraf, pakai kata-katamu sendiri. Kandidat: RLS-first (DB yang jagain data, API pakai client milik user), settle idempotent via trigger, 1 skema Zod buat client+server, `debt_date` kolom tambahan (D1).

---

## Trade-off: Kalau ada 1 hari lagi

TODO(owner): pilih yang kamu beneran bakal polish. Kandidat: integration test API + Playwright e2e, pagination/infinite scroll (sekarang limit 500), summary update optimistic, dark mode, export CSV.

---

## Time Spent

TODO(owner): jujur. (mis. "± X jam: DB+RLS Y jam, API Y jam, UI Y jam, polish/deploy Y jam")
