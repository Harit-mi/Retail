import { describe, it, expect } from "vitest";
import { calculateEan13CheckDigit, normalizeToEan13, encodeEan13Modules, getEan13Bars } from "../utils/ean13";
import { createEncryptedBackup, verifyAndDecryptBackup } from "../utils/backupRestore";
import { calculateGstSplit, calculateCartTotals } from "../utils/moneyMath";

describe("Production-Readiness Hardening & Reliability Suite", () => {
  describe("EAN-13 Barcode Algorithm Compliance", () => {
    it("correctly computes standard GS1 check digit for known barcodes", () => {
      // 12 digits: 890105885227 -> Check digit should be 1
      const check1 = calculateEan13CheckDigit("890105885227");
      expect(check1).toBe(1);

      // Known 13-digit barcode: 4006381333931 (STABILO Boss) -> first 12 digits: 400638133393 -> Check digit 1
      const check2 = calculateEan13CheckDigit("400638133393");
      expect(check2).toBe(1);
    });

    it("normalizes arbitrary short or unpadded barcodes to valid 13-digit EAN-13", () => {
      const normalized = normalizeToEan13("12345");
      expect(normalized.length).toBe(13);
      const expectedCheck = calculateEan13CheckDigit(normalized.slice(0, 12));
      expect(Number(normalized.slice(12))).toBe(expectedCheck);
    });

    it("encodes valid EAN-13 modules with exactly 95 binary modules including guard markers", () => {
      const { ean13, modules } = encodeEan13Modules("4006381333931");
      expect(ean13).toBe("4006381333931");
      expect(modules.length).toBe(95);

      // Start guard marker: 101
      expect(modules.startsWith("101")).toBe(true);

      // Center guard marker: 01010 at position 45-49
      expect(modules.slice(45, 50)).toBe("01010");

      // End guard marker: 101
      expect(modules.endsWith("101")).toBe(true);
    });

    it("generates run-length encoded bars that sum up to 95 modules", () => {
      const { runs } = getEan13Bars("8906007280011");
      const totalWidth = runs.reduce((acc, r) => acc + r.width, 0);
      expect(totalWidth).toBe(95);
    });
  });

  describe("Encrypted Vault Backup & Restore", () => {
    const mockStoreBundle = {
      storeConfig: { name: "Gupta Kirana Store", gstin: "07AAAAA0000A1Z5" },
      products: [{ id: "p1", name: "Fortune Sunlite Oil 1L", retailPrice: 145, stock: 50 }],
      customers: [{ id: "c1", name: "Rahul Sharma", balance: 450 }],
      suppliers: [],
      purchaseOrders: [],
      sales: [{ id: "INV-1001", grandTotal: 500, date: new Date().toISOString() }],
    };
    const testPin = "7890";

    it("creates an encrypted backup string with DUKAAN_VAULT_v1 header and zero plaintext", async () => {
      const backupBlob = await createEncryptedBackup(mockStoreBundle, testPin);
      expect(backupBlob.startsWith("DUKAAN_VAULT_v1::")).toBe(true);
      expect(backupBlob).not.toContain("Fortune Sunlite Oil");
      expect(backupBlob).not.toContain("07AAAAA0000A1Z5");
    });

    it("verifies and restores store database with the correct cashier PIN", async () => {
      const backupBlob = await createEncryptedBackup(mockStoreBundle, testPin);
      const res = await verifyAndDecryptBackup(backupBlob, testPin);

      expect(res.success).toBe(true);
      expect(res.data.storeConfig.name).toBe("Gupta Kirana Store");
      expect(res.data.products.length).toBe(1);
      expect(res.data.products[0].retailPrice).toBe(145);
      expect(res.data.customers[0].name).toBe("Rahul Sharma");
    });

    it("fails closed when restoring with an incorrect cashier PIN", async () => {
      const backupBlob = await createEncryptedBackup(mockStoreBundle, testPin);
      const wrongPin = "0000";
      const res = await verifyAndDecryptBackup(backupBlob, wrongPin);

      expect(res.success).toBe(false);
      expect(res.data).toBeUndefined();
    });

    it("rejects tampered or corrupt backup strings gracefully", async () => {
      const res = await verifyAndDecryptBackup("DUKAAN_VAULT_v1::corrupt_random_data", testPin);
      expect(res.success).toBe(false);
    });
  });

  describe("Paise Precision GST Arithmetic", () => {
    it("ensures taxableAmount + totalTax strictly equals price without floating point drift", () => {
      const prices = [99, 145, 275, 499, 1250, 3999];
      const gstRates = [5, 12, 18, 28];

      for (const p of prices) {
        for (const r of gstRates) {
          const split = calculateGstSplit(p, r, false);
          const sum = Math.round((split.taxableAmount + split.totalTax) * 100) / 100;
          expect(sum).toBe(p);
          expect(Math.round((split.cgst + split.sgst) * 100) / 100).toBe(split.totalTax);
        }
      }
    });

    it("guarantees cart subtotal matches taxableSubtotal + taxAmount", () => {
      const cart = [
        { id: "1", name: "Item A", price: 199, qty: 3, gst: 18 },
        { id: "2", name: "Item B", price: 79, qty: 5, gst: 12 },
        { id: "3", name: "Item C", price: 349, qty: 1, gst: 5 },
      ];
      const totals = calculateCartTotals(cart, 25, 0, null, 0);
      const reconstructedSubtotal = Math.round((totals.taxableSubtotal + totals.taxAmount) * 100) / 100;
      expect(reconstructedSubtotal).toBe(totals.subtotal);
    });
  });
});
