# DukaanPOS — Fast Kirana & Grocery Store Register POS (Local-First Edition)

[![CI Build & Test](https://github.com/Harit-mi/Retail/actions/workflows/ci.yml/badge.svg)](https://github.com/Harit-mi/Retail/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vitest Unit Tests](https://img.shields.io/badge/Vitest-3.0_Passed-1FAA59.svg)](https://vitest.dev)
[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38B2AC.svg)](https://tailwindcss.com)
[![DPDP Act Principles](https://img.shields.io/badge/Privacy-DPDP_Act_2023_Principles-0EA5A5.svg)](#security--dpdp-act-2023-privacy-principles)

> **DukaanPOS (Kirana Store Edition)** is a local-first, offline-capable point of sale (POS) web application engineered specifically for Indian Kirana and FMCG grocery shopkeepers. Built for extreme counter speed, large touch targets, zero-deadend feedback, and zero-ambiguity billing math.

---

## 🇮🇳 Kirana-First Core Feature Suite

### 1. 🧾 Counter POS Billing Register (`POSBillingScreen.jsx`)
- **8:4 Till Physical Layout**: High-contrast touch grid optimized for FMCG items, loose pulses, sugar, dairy, and packaged Kirana products.
- **Web Audio API Feedback**: Instant 880Hz cash register beep on barcode scan or item selection.
- **Cart Line Flash Animation**: Green ring flash highlight (`ring-2 ring-[#1FAA59]`) confirming item additions without intrusive modals.
- **Keyboard Shortcuts**: Built-in `F2` (Search), `F4` (Customer Select), and `F8` (Checkout) shortcuts.
- **Loudest Grand Total**: Tabular `IBM Plex Mono` currency digits with 3xl bold grand total display.
- **Dual Barcode Engine**: Supports USB/Bluetooth HID hardware barcode scanners + WebRTC smartphone camera scanning.

### 2. 📖 Udhaar Khata Credit Ledger (`CustomerLedger.jsx`)
- **DPDP Phone Number Masking**: Customer phone numbers masked as `+91 98765 *****` for data privacy.
- **Non-Alarmist Credit States**: Settled `₹0` balances shown in green; over-limit accounts flagged with amber badges without blocking shop operations.
- **Before / After Math Confirmation**: Instant green confirmation banner displaying before/after balance calculations (`Balance: ₹800 ➔ ₹300`) upon recording payments.
- **WhatsApp Reminder Deep-Link**: Direct `https://wa.me/` link generator with shop name, total balance, and store UPI ID.

### 3. 🏷️ Barcode Sticker Sheet Generator (`BarcodePrintModal.jsx`)
- **Multi-Item Quantity Selection**: Print custom sticker counts for loose pulses, sugar, dry fruits, and un-barcoded Kirana packs.
- **24-Label & 40-Label A4 Grids**: Live on-screen preview reflecting exact physical A4 sticker sheet geometry.
- **Print-CSS Calibrated Precision (`@media print`)**: 1-to-1 barcode grid alignment preventing wasted adhesive sticker paper stock.

### 4. 💬 WhatsApp Marketing Hub (`WhatsAppMarketingHub.jsx`)
- **Offer Broadcast Dispatcher**: Kirana discount announcements, festive offer alerts, and loyalty point rewards.
- **Receipt Sharing**: Send digital bill links and payment receipts directly to customer WhatsApp numbers.

### 5. 📊 Till Reconciliation & GST Filing Dashboard (`AnalyticsDashboard.jsx`)
- **End-of-Day Till Payment Mix**: Glanceable visual progress bar comparing Cash vs UPI vs Card vs Udhaar Dues.
- **GSTR-1 & GSTR-3B Tax Table**: HSN-wise breakdown of Taxable Values, CGST, SGST, IGST, and Total Tax.
- **1-Tap CSV Export**: Download CA-ready CSV files for monthly GST return filing.

---

## 🌐 12 Languages (10 Indian State Languages + Hinglish + English)

Includes zero-latency localized translations across **12 languages**:
- 🇬🇧 **English**
- 🇮🇳 **Hindi (हिन्दी)**
- 🇮🇳 **Hinglish** *(Counter Billing, Udhaar Khata, Total Bill Amount)*
- 🇮🇳 **Marathi (मराठी)** | 🇮🇳 **Tamil (தமிழ்)** | 🇮🇳 **Telugu (తెలుగు)** | 🇮🇳 **Gujarati (ગુજરાતી)**
- 🇮🇳 **Bengali (বাংলা)** | 🇮🇳 **Kannada (कन्नड)** | 🇮🇳 **Malayalam (മലയാളം)** | 🇮🇳 **Punjabi (ਪੰਜਾਬੀ)** | 🇮🇳 **Odia (ଓଡ଼ିଆ)**

---

## 🔒 Security & DPDP Act 2023 Privacy Principles

- **Local-First Data Storage**: All billing records, inventory items, and Khata ledgers remain 100% stored in your local browser/device (`localStorage`).
- **Data Erasure & Backup**: 1-click JSON offline data backup export and restore in Store Settings.
- **Dynamic NPCI UPI QR**: Merchant-to-customer UPI payment QR generated via open NPCI standards (`upi://pay?pa=...`).

---

## 🧪 Vitest Unit Testing & Quality Assurance

DukaanPOS includes automated **Vitest** unit tests verifying all money math, GST tax splits (CGST, SGST, IGST), rounding, and Khata credit ledger operations:

```bash
# Run Vitest unit test suite
npm test
```

Sample output:
```text
 ✓ src/tests/gstMath.test.js (3 tests) 2ms
 ✓ src/tests/inventoryKhata.test.js (2 tests) 2ms
 Test Files  2 passed (2)
      Tests  5 passed (5)
```

---

## 🚀 Quick Start (Local Setup)

```bash
# 1. Clone Repository
git clone https://github.com/Harit-mi/Retail.git
cd Retail

# 2. Install Dependencies
npm install

# 3. Start Development Server
npm run dev

# 4. Open in browser
# http://localhost:5173/
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
