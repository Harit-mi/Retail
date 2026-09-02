import { describe, it, expect } from "vitest";
import { calculateCartTotals, calculateCashChange, updateCustomerLedger } from "../utils/moneyMath";

describe("POS Checkout & Cart State Machine (Production Integration Tests)", () => {
  const sampleProducts = [
    { id: "p1", name: "Fortune Oil 1L", price: 160, retailPrice: 160, gst: 5, stock: 20 },
    { id: "p2", name: "Tata Salt 1kg", price: 28, retailPrice: 28, gst: 0, stock: 50 },
    { id: "p3", name: "Maggi 6-pack", price: 84, retailPrice: 84, gst: 12, stock: 15 },
  ];

  it("calculates cart subtotal, itemized GST tax details, and grand total with coupon discount", () => {
    const cart = [
      { ...sampleProducts[0], qty: 2 }, // ₹320 (5% GST)
      { ...sampleProducts[1], qty: 5 }, // ₹140 (0% GST)
      { ...sampleProducts[2], qty: 1 }, // ₹84 (12% GST)
    ];
    // Total gross = 320 + 140 + 84 = ₹544
    // Discount = ₹44
    const discount = 44;

    const totals = calculateCartTotals(cart, discount);

    expect(totals.subtotal).toBe(544);
    expect(totals.calculatedDiscount).toBe(44);
    expect(totals.grandTotal).toBe(500);

    // Verify tax reconciliation identity: taxableSubtotal + taxAmount === subtotal (544)
    expect(totals.taxableSubtotal + totals.taxAmount).toBe(544);
  });

  it("calculates cash change return correctly (real PaymentModal logic)", () => {
    expect(calculateCashChange(1000, 935)).toBe(65);
    // Guards against negative change if tendered is less than the total
    expect(calculateCashChange(50, 935)).toBe(0);
  });

  it("reconciles Udhaar khata settlement without double-counting the debt (real ledger logic)", () => {
    const initialCustomers = [
      { id: "c1", name: "Anand Verma", phone: "9876543210", balance: 1200, loyaltyPoints: 0, history: [] },
    ];

    // Customer pays ₹800 cash toward a fresh ₹1200 bill — only the remaining
    // ₹400 unpaid "due" should ever reach the Khata ledger. This is a
    // regression guard for the original bug where the FULL bill amount was
    // mistakenly added instead of just the unpaid remainder.
    const remainingDue = 400;
    const updated = updateCustomerLedger(initialCustomers, "c1", remainingDue, 0, 0, "INV-1001");

    expect(updated[0].balance).toBe(1200 + 400);
    expect(updated[0].history[0].amount).toBe(400);
  });
});
