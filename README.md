<div align="center">

  # 🏪 DukaanPOS
  ### *The Utilitarian Retail Workstation & Kirana ERP for India*

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![Vitest 100%](https://img.shields.io/badge/Tests-25%2F25%20Passing-2F5E3D?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
  [![DPDP 2023 Compliant](https://img.shields.io/badge/DPDP_2023-Compliant-C2782A?style=for-the-badge)](https://meity.gov.in)

  <p align="center">
    <b>Offline-First Latency</b> • <b>Zero Third-Party Data Leakage</b> • <b>Warm Paper & Deep Ink Aesthetic</b> • <b>AI Demand Forecasting</b>
  </p>

  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-design-system-warm-paper--deep-ink">Design System</a> •
    <a href="#-architecture--tech-stack">Architecture</a> •
    <a href="#-security--dpdp-compliance">Security & Privacy</a>
  </p>

  ---

</div>

## 💡 Overview

**DukaanPOS** is an ultra-fast, offline-first Point-of-Sale (POS) and retail management instrument built for India's 13+ million unorganized shopkeepers (Kiranas, General Stores, Apparel, Electronics, Pharmacies, and Jewelry outlets).

Designed with inspiration from **Teenage Engineering**, **Linear**, and **Japanese editorial typography**, DukaanPOS eliminates cold stark whites and aggressive AI gradients in favor of an ergonomic, 10-hour shift-ready physical instrument aesthetic (**"Warm Paper & Deep Ink"**).

---

## ✨ Key Features

### ⚡ 1. High-Velocity POS Billing Terminal
- **0ms Latency Billing**: Pure local state execution guarantees instant barcode scanning and item addition during evening rush hours.
- **Tactile Keyboard Keycaps**: Built-in physical shortcut badges (`<kbd>F2</kbd>` Search, `<kbd>F4</kbd>` Customer Lookup, `<kbd>F8</kbd>` Checkout).
- **GST Tax Engine**: Automatic CGST/SGST 50:50 splits, HSN code tracking, promo code discounts, and loyalty point redemptions.

### 🛡️ 2. Zero-Leak Offline Vector SVG QR Payments
- **Client-Side QR Renderer**: Generates dynamic UPI payment QR codes (`upi://pay?pa=...`) using a pure, zero-dependency vector SVG generator (`OfflineQrCode`).
- **Zero Third-Party Leaks**: 0 bytes sent to external QR generation services (`api.qrserver.com`), preventing tech giants from scraping shopkeeper transaction data.

### 🤖 3. AI Demand Forecasting & Auto-Reorder Engine
- **Predictive Velocity Analytics**: Analyzes past sales trends to calculate predicted stock runout timelines (e.g. *"Amul Butter: Runout in ~2 days"*).
- **1-Click Purchase Orders**: Auto-calculates optimal reorder buffers and generates draft supplier POs in a single click.

### 🖨️ 4. Barcode Label Generator & Printing Station
- **EAN-13 Barcode Vector Engine**: Generates 1D vector barcode streams on the fly.
- **Responsive Sticker Sheets**: Supports 24-grid and 30-grid printable layouts with strict line-height clipping (`truncate`, `leading-tight`) to ensure zero text overlap.

### 📖 5. Udhaar Credit Ledger (Khata Module)
- **Customer Credit Accounts**: Tracks active balances, logs partial payments, and records pending dues.
- **UUID Data Protection**: Assigns unique UUIDs to quick-created customer accounts to guarantee zero credit balance loss.

### 🔒 6. Shift Cash Drawer Audit & Register Lock
- **Shift Drawer Reconciliation**: Calculates `Opening Cash` + `Current Shift Cash Sales` - `Cash Drops` = `Expected Total`.
- **4-Digit Counter Lock Screen**: Instant register lock (`1234` default) with non-destructive PIN updates that preserve customer credit databases.

---

## 🎨 Design System: "Warm Paper & Deep Ink"

DukaanPOS uses a calibrated warm-neutral palette designed specifically to eliminate cashier eye strain during 10-hour shifts:

```gantt
Canvas Background : #F7F5F0 (Warm Linen/Bone)
Surface Cards     : #FFFFFF (Warm White + 1px Hairline #E8E3DA)
Primary Typography: #191817 (Deep Warm Ink/Charcoal)
Secondary Text    : #736F68 (Muted Warm Taupe)
Brand Accent      : #C2782A (Roasted Amber)
Header Bar        : #2A2825 (Dark Charcoal Workstation)
Success Badge     : #2F5E3D (Matcha Green / #EEF4F0)
```

- **Monospace Tabular Figures**: Monetary amounts, stock quantities, and barcodes use `IBM Plex Mono` / `font-variant-numeric: tabular-nums` for rapid numerical alignment.
- **Flat 1px Hairlines**: Eliminates drop shadows (`shadow-lg`) in favor of flat hairlines (`border-[#E8E3DA]`).

---

## 🛠️ Architecture & Tech Stack

```text
dukaan-pos/
├── src/
│   ├── components/
│   │   ├── AI/                 # AIDemandForecastingCard.jsx (Stock prediction)
│   │   ├── Barcode/            # BarcodePrintModal.jsx (Sticker generator)
│   │   ├── CashDrawer/         # ShiftReconciliationModal.jsx (Shift cash audit)
│   │   ├── Inventory/          # InventoryList.jsx & AddEditProductModal.jsx
│   │   ├── Khata/              # CustomerLedger.jsx (Udhaar credit book)
│   │   ├── Landing/            # ProductLandingPage.jsx (Marketing showcase & video)
│   │   ├── POS/                # POSBillingScreen.jsx, PaymentModal.jsx, CustomerSelectModal.jsx
│   │   ├── Reports/            # AnalyticsDashboard.jsx (GSTR-1 tax reporting)
│   │   ├── Security/           # SecurityPrivacyPanel.jsx (DPDP 2023 audit)
│   │   ├── Navbar.jsx          # Workstation header & Online Cloud Sync badge
│   │   └── Sidebar.jsx         # Navigation drawer
│   ├── context/
│   │   └── StoreContext.jsx    # Realtime Cloud Sync & State Provider
│   ├── types/
│   │   └── index.ts            # TypeScript Domain Model Types
│   ├── utils/
│   │   ├── moneyMath.js        # Financial & GST tax calculations
│   │   ├── qrCodeSvg.jsx       # Zero-leak local vector SVG QR component
│   │   └── storageCrypto.js    # Web Crypto AES-GCM + PBKDF2 100k iteration storage
│   └── App.jsx                 # Main container & register lock overlay
├── tsconfig.json               # TypeScript Compiler Configuration
└── vite.config.js              # Vite Build Pipeline & CSP Headers
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/latent-spaces/dukaan-pos.git
cd dukaan-pos

# 2. Install dependencies
npm install

# 3. Start local development server (runs on http://localhost:5173/)
npm run dev

# 4. Execute Vitest unit & integration test suite (25/25 passing)
npm test

# 5. Build production distribution bundle
npm run build
```

---

## 🛡️ Security & DPDP Act 2023 Audit Matrix

| Security Feature | Specification & Enforcement | Status |
|---|---|---|
| **Data Privacy (Section 5)** | Phone numbers masked in public views (`+91 98765 *****`) | ✅ Verified |
| **Right-to-Erasure (Section 12)** | 1-click permanent customer record deletion modal | ✅ Verified |
| **Formula Injection Shield** | Escapes spreadsheet trigger characters (`=`, `+`, `-`, `@`) during CSV exports | ✅ Verified |
| **Storage Cryptography** | PBKDF2 (100,000 iterations) + AES-GCM 256-bit client-side encryption | ✅ Verified |
| **Counter Register Lock** | 4-Digit PIN screen lock (`1234` default) with masked input | ✅ Verified |

---

## 🧪 Verification & Test Coverage

```bash
 RUN  v3.2.7 /Users/haritmishra/.gemini/antigravity/scratch/dukaan-pos

 ✓ src/tests/dpdpCompliance.test.js (2 tests)
 ✓ src/tests/fullAppButtonsIntegrity.test.js (8 tests)
 ✓ src/tests/inventoryKhata.test.js (3 tests)
 ✓ src/tests/posCartCheckout.test.js (3 tests)
 ✓ src/tests/gstMath.test.js (3 tests)
 ✓ src/tests/securityStrixAudit.test.js (3 tests)
 ✓ src/tests/cryptoStorage.test.js (3 tests)

 Test Files  7 passed (7)
      Tests  25 passed (25)
   Start at  20:09:26
   Duration  462ms
```

---

<div align="center">

  Made with ❤️ for Bharat's retail merchants.

  **DukaanPOS** • Designed for 10-Hour Shifts.

</div>
