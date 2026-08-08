# DukaanPOS — All-Rounder Retail POS for Indian SMBs (Multi-Vertical Edition)

[![CI Build & Test](https://github.com/Harit-mi/Retail/actions/workflows/ci.yml/badge.svg)](https://github.com/Harit-mi/Retail/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vitest Unit Tests](https://img.shields.io/badge/Vitest-3.0_Passed-1FAA59.svg)](https://vitest.dev)
[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38B2AC.svg)](https://tailwindcss.com)
[![DPDP Act Compliant](https://img.shields.io/badge/Privacy-DPDP_Act_2023-0EA5A5.svg)](#security--dpdp-act-2023-privacy)

> **DukaanPOS** is an open-source, local-first retail software engineered specifically for Indian small & medium businesses (SMBs) across 7 major business verticals — Kirana/Grocery, Clothing/Apparel, Pharmacy, Electronics, Salon/Spa, Restaurant/QSR, and Jewelry.

---

## 🇮🇳 Why DukaanPOS?

Trying to hardcode one product schema for "clothing + kirana" and then bolting on more business types later gets messy fast. A pharmacy's expiry/batch rules, a jewelry store's weight+purity pricing, and a salon's appointment-based billing are structurally different problems.

DukaanPOS solves this with a **Multi-Vertical JSONB Attributes Architecture** and a **Pluggable Module Engine**.

---

## ⚡ 1-Click Live Deployment

Deploy your own live hosted instance of DukaanPOS to Vercel or Netlify instantly:

| Provider | Deploy Button |
| :--- | :--- |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHarit-mi%2FRetail) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Harit-mi/Retail) |

---

## 🛒 7 Vertical Modules Overview

| Vertical | Domain Logic & Features | Supported Attribute Keys |
| :--- | :--- | :--- |
| 🛒 **Kirana / Grocery** | Loose/weighed items (kg, g, Ltr), FMCG barcode lookup, high-volume counter speed | `batch_no`, `expiry_date` |
| 👔 **Clothing & Apparel** | Size × Color × Brand variant matrix grid, seasonal stock management | `size`, `color`, `brand` |
| 💊 **Pharmacy & Medical** | FEFO (First-Expiry-First-Out) batch engine, Schedule H/H1 drug flags, Rx mandatory warnings | `batch_no`, `expiry_date`, `drug_schedule`, `requires_prescription` |
| 📱 **Electronics & Mobile** | Serial / IMEI tracking per unit, warranty period logging | `imei`, `serial_no`, `warranty_months` |
| 💇 **Salon, Spa & Wellness** | Service packages, staff appointment booking slots & commission tracking | `duration_mins`, `default_staff`, `commission_percent` |
| 🍽️ **Restaurant, Café & QSR** | Table layout management, Kitchen Order Tickets (KOT) dispatcher | `is_kot_item`, `kitchen_dept`, `spice_level` |
| 💎 **Jewelry & Bullion** | Weight (g), 22K/18K purity rating, live metal rate feed, BIS Hallmark, PAN KYC alert (>₹2 Lakhs) | `purity`, `gross_weight`, `net_weight`, `making_charge_type`, `making_charge_value` |

---

## 🌐 12 Indian State Languages Support

DukaanPOS includes zero-latency localized translations across **12 Indian languages**:
- 🇬邦 **English**
- 🇮🇳 **Hindi (हिन्दी)**
- 🇮🇳 **Hinglish** *(Counter Billing, Udhaar Khata, Total Bill Amount)*
- 🇮🇳 **Marathi (मराठी)**
- 🇮🇳 **Tamil (தமிழ்)**
- 🇮🇳 **Telugu (తెలుగు)**
- 🇮🇳 **Gujarati (ગુજરાતી)**
- 🇮🇳 **Bengali (বাংলা)**
- 🇮🇳 **Kannada (ಕನ್ನಡ)**
- 🇮🇳 **Malayalam (മലയാളം)**
- 🇮🇳 **Punjabi (ਪੰਜਾਬੀ)**
- 🇮🇳 **Odia (ଓଡ଼ିଆ)**

---

## 🔒 Security & DPDP Act 2023 Privacy

- **Local-First Zero Cloud Leakage**: All billing data, customer Khata ledgers, and sales invoices remain 100% stored on your local browser/device. No third-party tracking.
- **DPDP Act 2023 Compliance**: Customer phone number masking option (`+91 98765 *****`) and Right-to-Erasure consent management.
- **Dynamic NPCI UPI QR**: Direct merchant-to-customer UPI payment QR code generated via open NPCI URI standards (`upi://pay?pa=...`).

---

## 🛠️ Architecture & System Scope

| Component | Implementation Detail | Status |
| :--- | :--- | :---: |
| **GST Split Engine** | Auto-splits CGST + SGST for intra-state sales & IGST for inter-state billing | **Implemented & Unit Tested** |
| **Khata Udhaar Book** | Customer credit ledger with WhatsApp payment reminder generator | **Implemented** |
| **Shift Drawer Audit** | Cash float tracking, expected vs physical counted cash audit | **Implemented** |
| **Supplier PO & GRN** | Distributor directory, Goods Receipt Note shipment entry & stock auto-refill | **Implemented** |
| **Barcode Scanning** | Keyboard hardware scanner support + Barcode Scanner Simulator | **Implemented** |
| **Receipt Printing** | 80mm Thermal Slip & A4 Official GST Invoice print CSS templates | **Implemented** |
| **Data Persistence** | HTML5 `localStorage` (Local-First, Zero Cloud Dependency) | **Known Constraint** |

---

## 🧪 Unit Testing & Quality Assurance

DukaanPOS includes automated **Vitest** unit tests verifying all money math, GST tax splits (CGST, SGST, IGST), rounding, and cart discount calculations:

```bash
# Run Vitest unit tests
npm test
```

Sample output:
```text
 ✓ src/tests/gstMath.test.js (3 tests) 2ms
 Test Files  1 passed (1)
      Tests  3 passed (3)
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

## 📜 License & Contributing

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
Contributions, feature suggestions, and pull requests are welcome! See [`CONTRIBUTING.md`](CONTRIBUTING.md).
