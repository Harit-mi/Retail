# DESIGN.md — DukaanPOS (Kirana / Retail Counter POS Edition)

> Official Plain-Text Design System Specification for DukaanPOS.
> Built following the Google Stitch & VoltAgent `DESIGN.md` standard.

---

## 1. Aesthetic Direction & Design Read

* **Aesthetic Read:** Physical Cash Counter & Digital Till Register System. High-density, professional retail billing interface built for Indian Kirana & retail store operations. Zero generic SaaS slop, zero AI-purple mesh gradients.
* **Three Dial Configuration:**
  * `DESIGN_VARIANCE: 6` (Structured grid alignment, consistent till header bars)
  * `MOTION_INTENSITY: 4` (Snappy 150ms transitions, `motion-reduce` support)
  * `VISUAL_DENSITY: 8` (High data density: quick-scan item grid, itemized cart ledger, live payment mix pulse bar)

---

## 2. Color Palette & Design Tokens

### Primary Brand Palette
* **Dark Register Panel Header:** `#0F1F35` (Deep Navy / Slate 950 — used for top ledger header bars, till summary bars, modal headers)
* **Primary Interactive Navy:** `#1E3A5F` (Used for active navigation tabs, action buttons, table headers)
* **Amber LED Display Accent:** `#F5A623` (Used for grand total figures, checkout buttons, price highlights)
* **Emerald Success & Settlement:** `#1FAA59` (Used for settled balances, +1 scan feedback, UPI indicators)
* **Crimson Warning / Dues:** `#E64545` (Used for out-of-stock badges, overdue Udhaar dues)

### Neutral Surface Tokens
* **App Background:** `#F7F8FA`
* **Card Surface:** `#FFFFFF`
* **Border Color:** `#E2E8F0` (`border-2 border-slate-200` for crisp card boundaries)
* **Muted Text:** `#64748B` (`text-slate-500`)
* **Primary Text:** `#0F172A` (`text-slate-900`)

---

## 3. Typography Standards

* **Display & Body Font:** System Sans / Inter / Display (`font-display`, `font-sans`)
* **Numeric & Financial Typography:** `font-mono tabular-nums` MANDATORY for:
  * Prices & Totals (e.g. `₹1,250`)
  * Stock Quantities (e.g. `10 Pcs`)
  * Barcodes & HSN Codes
  * Cashier Lock PIN (`••••`)
* **Widow Prevention:** `text-balance` on section headings & modal titles.

---

## 4. Component Layout Patterns

### A. Register Headers
* All main screens & modal dialogs MUST start with the `#0F1F35` dark register header strip.
* Includes an icon badge in `#F5A623` amber with bold display typography.

### B. Cards & Tables
* Cards use `bg-white border-2 border-slate-200 rounded-xl shadow-xs`.
* Tables use `#0F1F35` or `bg-slate-100` headers with `font-mono uppercase text-[10px]` tracking.

### C. Modals & Overlays
* Backdrops use `bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4`.
* Dialog containers use `bg-white rounded-xl border-2 border-slate-200 max-w-lg shadow-2xl overflow-hidden`.
* Accessibility: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="[id]"`.

### D. Focus & Motion
* Keyboard focus: `focus-visible:ring-2 focus-visible:ring-[#1E3A5F]`.
* Motion reduced: `motion-reduce:animate-none` on transitions.

---

## 5. Form & Content Guidelines

* **Search & Inputs:** Placeholders end with `…` (e.g. `Search items, barcode, HSN…`).
* **Non-text inputs:** `spellCheck={false}` and `autoComplete="off"` on PINs, HSN, barcodes, and numbers.
* **Icon Buttons:** All icon-only buttons require explicit `aria-label`.
* **Decorative Icons:** Decorative Lucide / FontAwesome icons require `aria-hidden="true"`.
