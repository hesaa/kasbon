# Kasbon — Anti-Slop Design System (`docs/DESIGN.md`)

This design document governs all UI implementation for Kasbon, adhering strictly to §11.10 of `KASBON_PRD-FINAL.md`.

---

## 1. Design Principles

1. **Money is the Hero:** Large, crisp, `tabular-nums` typography with unmistakable semantic color coding (Emerald for money coming in, Rose for money going out).
2. **Flat Surfaces & Hairline Borders:** Zero decorative gradient washes, zero glassmorphism, zero blurred background blobs, and zero heavy drop shadows. Card surfaces use solid white with crisp `border-slate-200` hairline borders. Shadows are reserved exclusively for floating overlays (modal sheet, FAB, toast).
3. **Radius & Tint Hierarchy:**
   - **Net Card:** Full-width hero surface with subtle background tinting (`emerald-50` / `rose-50`) and bold Net value.
   - **List Items:** Share a single white card container separated by subtle hairline dividers (`divide-y divide-slate-100`), avoiding the repetitive "identical floating rounded cards kit".
4. **No Emoji or Decorative Fluff:** Icons are restricted strictly to Lucide SVG icons that aid visual scanning (arrows for debt type, checkmarks for lunas, alert triangles for overdue). No stock illustrations or middle-dot string soups.
5. **Mobile-First Touch Ergonomics:** All interactive buttons and inputs maintain a minimum touch target of **44×44px** with clear focus ring indicators (`focus-visible`).

---

## 2. Palette (Hex Tokens)

| Token Name | Hex | Purpose |
|---|---|---|
| `--color-bg` | `#f8fafc` | Page background (`slate-50`) |
| `--color-surface` | `#ffffff` | Card & modal background |
| `--color-border` | `#e2e8f0` | Hairline border (`slate-200`) |
| `--color-accent` | `#4f46e5` | Primary brand buttons, active focus (`indigo-600`) |
| `--color-owed` | `#059669` | `owed_to_me` text & positive net (`emerald-600`) |
| `--color-owed-bg` | `#ecfdf5` | `owed_to_me` badge & net card tint (`emerald-50`) |
| `--color-owe` | `#e11d48` | `i_owe` text & negative net (`rose-600`) |
| `--color-owe-bg` | `#fff1f2` | `i_owe` badge & net card tint (`rose-50`) |
| `--color-text` | `#0f172a` | Primary headings & values (`slate-900`) |
| `--color-muted` | `#64748b` | Subtitle & metadata text (`slate-500`) |

---

## 3. Typography Scale & Roles

- **Font Family:** Plus Jakarta Sans (`var(--font-sans)`).
- **Numbers:** Always styled with `tabular-nums` for deterministic column alignment.
- **Scale:**
  - `Hero Value`: 24px (1.5rem) / Line 1.2 / Bold (`font-bold`)
  - `Card Value`: 18px (1.125rem) / Line 1.3 / Bold (`font-bold`)
  - `Section Heading`: 16px (1rem) / Line 1.4 / SemiBold (`font-semibold`)
  - `Body`: 14px (0.875rem) / Line 1.5 / Regular (`font-normal`)
  - `Meta / Caption`: 12px (0.75rem) / Line 1.4 / Medium (`font-medium`)

---

## 4. Spacing, Radius & Elevation Scale

- **Radius:**
  - `Hero Net Card`: `rounded-2xl` (16px)
  - `Inputs / Buttons / Dialogs`: `rounded-xl` (12px)
  - `Badges / Avatars`: `rounded-full` (9999px)
- **Elevation:**
  - Flat Cards: `border border-slate-200` (shadow: `shadow-xs`)
  - Modals & Sheets: `shadow-xl`
  - Floating Action Button (FAB): `shadow-lg shadow-indigo-500/20`
- **Page Container:** `mx-auto max-w-3xl px-4 pb-28 pt-6`

---

## 5. Mobile & Desktop ASCII Wireframes

### Mobile Viewport (375px)
```
+------------------------------------------+
| [W] Kasbon                  [user@mail] [Out] |
+------------------------------------------+
| HERO NET CARD (Full Width)               |
| Net: +Rp 1.100.000 (Lebih banyak dibayar)|
+------------------------------------------+
| TOTALS GRID (2 Cols)                     |
| [Dihutang: Rp 1.500.000] [Hutang: Rp 400.0] |
+------------------------------------------+
| TOOLBAR: [Status: Semua v] [Tipe: Semua v] |
| [Search: Cari nama...                  ] |
+------------------------------------------+
| ENTRY LIST (Single Card, Grouped Dividers)|
| (B) Budi                +Rp 250.000      |
|     [Dihutang] 3 hari lalu [Belum Lunas] |
|     Note: Patungan makan malam           |
|     [Tandai Lunas]  [Pencil] [Trash]     |
| ---------------------------------------- |
| (A) Andi                -Rp 400.000      |
|     [Saya Hutang] 1 minggu lalu [Lunas]  |
|     [Batal Lunas]   [Pencil] [Trash]     |
+------------------------------------------+
|                              [(+) Catat] |
+------------------------------------------+
```

### Desktop Viewport (1280px)
```
+--------------------------------------------------------------------------+
|  [W] Kasbon                                       user@email.com  [Keluar]|
+--------------------------------------------------------------------------+
|  SUMMARY CARDS (3 Equal Columns)                                          |
|  +---------------------+  +---------------------+  +-------------------+  |
|  | Total dihutang      |  | Total saya hutang   |  | Net               |  |
|  | Rp 1.500.000        |  | Rp 400.000          |  | +Rp 1.100.000     |  |
|  | 3 belum lunas       |  | 1 belum lunas       |  | Optimal           |  |
|  +---------------------+  +---------------------+  +-------------------+  |
|                                                                           |
|  TOOLBAR                                                                  |
|  [Search...]  [Status: Semua v]  [Tipe: Semua v]  [Sort v]  [+ Catat Baru]|
|                                                                           |
|  DEBT LIST                                                                |
|  +---------------------------------------------------------------------+  |
|  | Budi  [Dihutang]  3 hari lalu  [Belum Lunas]   +Rp 250.000 [Lunas] [E][D]|  |
|  |---------------------------------------------------------------------|  |
|  | Andi  [Saya Hutang] 1 minggu lalu [Lunas]      -Rp 400.000 [Batal] [E][D]|  |
|  +---------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```
