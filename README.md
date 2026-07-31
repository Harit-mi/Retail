# DukaanPOS — Multi-Vertical Indian Retail POS Software

> **All-Rounder Retail Point of Sale (POS) and Store Management Software** engineered for Indian Small and Medium Businesses (Kirana, Clothing, Pharmacy, Electronics, Salon, Restaurant, Jewelry, and General Retail).

![DukaanPOS Banner](https://img.shields.io/badge/DukaanPOS-Multi--Vertical-emerald?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Vite-React%20%2B%20TailwindCSS-blue?style=for-the-badge) ![License](https://img.shields.io/badge/GST-India%20Compliant-orange?style=for-the-badge)

---

## 🚀 Key Features & Vertical Modules

### 1. Core POS & Billing Engine
- **Lightning Counter POS**: Search items by Name, Barcode, HSN, IMEI, or Brand with hotkey support (`F2` Search, `F4` Customer select).
- **Barcode Scanner Simulator**: Single-click barcode simulation with audio-visual scanning feedback.
- **Auto GST Tax Engine**: Intra-state (CGST + SGST) vs Inter-state (IGST) split across 0%, 5%, 12%, 18%, and 28% GST brackets.
- **Instant UPI QR Code Generator**: Generates dynamic NPCI-compliant UPI QR codes displaying exact payable amounts for instant scanning via GPay, PhonePe, Paytm, or BHIM.
- **Multi-Mode Checkout**: Cash (with instant return change calculator), UPI QR, Credit/Debit Card, and Customer Udhar Khata.
- **Dual Printing Layouts**:
  - **80mm Thermal Receipt Slip** (for Kirana / Grocery / Quick Counter billing).
  - **Full A4 GST Tax Invoice** (for Apparel, Electronics, Jewelry, and B2B orders).

### 2. Pluggable Business Verticals
- 🛒 **Kirana & Grocery**: Weighable items (kg, g, ltr, pack), FMCG, and FEFO (First-Expiry-First-Out) batch management.
- 👔 **Clothing & Apparel**: Size × Color × Brand variant matrix grid.
- 💊 **Pharmacy & Medical**: Batch number, Expiry date logging, Schedule H flags, and Rx prescription mandatory warnings.
- 📱 **Electronics & Mobile**: Per-unit IMEI & Serial number tracking, warranty tracking, and Bajaj Finserv/Partner EMI installment calculator.
- 💇 **Salon, Spa & Wellness**: Service catalog billing, appointment calendar slot booking, and stylist commission tracking.
- 🍽️ **Restaurant, Café & QSR**: Table layout manager (Dine-in / Takeaway / Delivery) and instant Kitchen Order Ticket (KOT) dispatcher.
- 💎 **Jewelry & Bullion**: Live Gold (22K / 18K) & Silver metal rate feed, making charges, and regulatory PAN/KYC alert threshold above ₹2 Lakhs.

### 3. Udhar Khata (Customer Credit Ledger)
- Track customer balances ("Udhar") with credit limits.
- Record partial dues and credit payment collection.
- **WhatsApp Payment Reminder Simulator**: Instant reminder message generation with one-click copy or notification.

---

## 🛠️ Tech Stack & Setup

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Canvas Confetti
- **State & Storage**: React Context API with full `localStorage` persistence

### Quick Start

```bash
# Clone repository
git clone https://github.com/Harit-mi/Retail.git
cd Retail

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📜 License
Developed with ❤️ for Indian Small & Medium Retail Enterprises.
