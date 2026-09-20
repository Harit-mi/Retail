import { calculateGstSplit, calculateCashChange, calculateCartTotals } from "../src/utils/moneyMath.js";
import { INDIAN_LANGUAGES, translations } from "../src/i18n/translations.js";
import fs from "fs";
import path from "path";

console.log("==========================================");
console.log("  DUKAANPOS FULL SYSTEM HEALTH CHECK");
console.log("==========================================");

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Math & GST Logic
const gstResult = calculateGstSplit(118, 18, false);
assert(Math.round(gstResult.totalTax) === 18, `GST 18% inclusive on 118 should be 18 (got ${gstResult.totalTax})`);
assert(Math.round(gstResult.cgst * 2) === 18, `CGST + SGST should sum to 18`);

// 2. Cart Totals Math
const sampleCart = [
  { id: "1", name: "Atta", price: 100, qty: 2, total: 200, gst: 5 },
  { id: "2", name: "Oil", price: 200, qty: 1, total: 200, gst: 18 },
];
const cartTotals = calculateCartTotals(sampleCart, 0, 0, null, 0);
assert(cartTotals.subtotal === 400, `Cart subtotal should be 400 (got ${cartTotals.subtotal})`);
assert(cartTotals.grandTotal === 400, `Grand total should be 400 (got ${cartTotals.grandTotal})`);

// 3. Money Math Cash Change
const change = calculateCashChange(500, 380);
assert(change === 120, `Change for 500 tendered on 380 should be 120 (got ${change})`);

const exactChange = calculateCashChange(500, 500);
assert(exactChange === 0, `Exact cash change should be 0`);

// 4. Internationalization & Language Schema Integrity
assert(INDIAN_LANGUAGES.length >= 10, `At least 10 Indian languages configured (got ${INDIAN_LANGUAGES.length})`);

INDIAN_LANGUAGES.forEach((lang) => {
  assert(lang.code && lang.name && lang.native && lang.flag, `Language ${lang.name} has code, name, native, and flag`);
});

assert(translations.en && translations.hi, `English and Hindi translations exist`);

// 5. PWA Assets Check
const manifestPath = path.resolve("public/manifest.webmanifest");
assert(fs.existsSync(manifestPath), `PWA Web Manifest exists at ${manifestPath}`);
const manifestData = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
assert(manifestData.name === "DukaanPOS — Fast Kirana & Retail POS", `Manifest name is correct`);

const swPath = path.resolve("public/sw.js");
assert(fs.existsSync(swPath), `Service Worker exists at ${swPath}`);

// 6. Essential Components Existence
const essentialComponents = [
  "src/components/Navbar.jsx",
  "src/components/Sidebar.jsx",
  "src/components/POS/POSBillingScreen.jsx",
  "src/components/POS/PaymentModal.jsx",
  "src/components/POS/CustomerSelectModal.jsx",
  "src/components/CashDrawer/ShiftReconciliationModal.jsx",
  "src/components/Legal/PrivacyPolicyModal.jsx",
  "src/components/Security/SecurityPrivacyPanel.jsx",
  "src/components/Dashboard/DashboardOverview.jsx",
  "src/components/Landing/ProductLandingPage.jsx",
];

essentialComponents.forEach((compPath) => {
  assert(fs.existsSync(path.resolve(compPath)), `Component ${compPath} exists`);
});

console.log("==========================================");
console.log(`RESULTS: ${passedCount}/${totalCount} checks PASSED!`);
console.log("==========================================");
