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

### Strict Minimalist 2-Color Architecture (Black & White)
* **Primary Color 1 (Black):** `#09090B` / `#000000` (Used for primary text in light mode, solid action buttons, keycap headers, and pure canvas in dark mode)
* **Primary Color 2 (White):** `#FFFFFF` / `#FAFAFA` (Used for pure canvas in light mode, text/buttons in dark mode)
* **Neutral Grayscale Ramp:** `#18181B` (zinc-900), `#27272A` (zinc-800), `#71717A` (zinc-500), `#E4E4E7` (zinc-200), `#F4F4F5` (zinc-100)
* **Zero Rainbow Clutter:** No extraneous amber, emerald, blue, or purple — strictly minimal monochrome styling across all screens.

### Dual Theme Modes (Light & Dark)
* **Light Mode:** Crisp white canvas (`#FFFFFF`), solid black typography and button highlights, hairline `#E4E4E7` borders.
* **Dark Mode:** Deep black canvas (`#09090B`), solid white typography and action buttons, subtle `#27272A` borders.
* **Instant Toggle:** Accessible via Sun/Moon icon in Navbar and dedicated theme tiles in Store Settings.

---

## 3. Typography Standards

* **Display & Brand Font:** Outfit / Plus Jakarta Sans (`font-display`) — geometric, modern, punchy retail headings
* **Body & UI Font:** Plus Jakarta Sans (`font-sans`) — high-legibility modern SaaS typography
* **Customizable Styles:** Plus Jakarta Sans (default), Poppins, Space Grotesk, Inter (`data-font-style`)
* **Numeric & Financial Typography:** `font-mono tabular-nums` (JetBrains Mono) MANDATORY for:
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
