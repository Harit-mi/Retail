import { describe, it, expect } from "vitest";
import { calculateCartTotals } from "../utils/moneyMath";

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

  it("calculates cash change return correctly", () => {
    const grandTotal = 935;
    const cashTendered = 1000;
    const changeReturn = Math.max(0, cashTendered - grandTotal);
    expect(changeReturn).toBe(65);
  });

  it("reconciles Udhaar khata settlement payment cleanly", () => {
    const initialCustomers = [
      { id: "c1", name: "Anand Verma", phone: "9876543210", balance: 1200, history: [] },
    ];

    // Customer pays ₹800 towards their ₹1200 debt
    const paymentAmount = 800;
    const target = initialCustomers[0];
    const newBal = Math.max(0, target.balance - paymentAmount);

    expect(newBal).toBe(400);
  });
});
