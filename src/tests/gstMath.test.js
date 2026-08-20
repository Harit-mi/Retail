import { describe, it, expect } from "vitest";
import { calculateGstSplit, calculateCartTotals } from "../utils/moneyMath";

describe("Production GST Tax & Cart Math (src/utils/moneyMath.js)", () => {
  it("calculates 5% intra-state CGST + SGST split correctly", () => {
    const res = calculateGstSplit(100, 5, false);
    expect(res.taxableAmount).toBe(95.24);
    expect(res.totalTax).toBe(4.76);
    expect(res.cgst).toBe(2.38);
    expect(res.sgst).toBe(2.38);
    expect(res.igst).toBe(0);
  });

  it("calculates 18% inter-state IGST split correctly", () => {
    const res = calculateGstSplit(1180, 18, true);
    expect(res.taxableAmount).toBe(1000);
    expect(res.totalTax).toBe(180);
    expect(res.cgst).toBe(0);
    expect(res.sgst).toBe(0);
    expect(res.igst).toBe(180);
  });

  it("independently computes cart subtotal, discount, grand total, taxable base, and output tax", () => {
    const cart = [
      { id: "1", name: "Aashirvaad Atta 5kg", price: 275, qty: 2, gst: 5 }, // 550 total -> Taxable: 523.81, Tax: 26.19
      { id: "2", name: "Fortune Sunlite Oil 1L", price: 145, qty: 3, gst: 5 }, // 435 total -> Taxable: 414.29, Tax: 20.71
    ];
    const totals = calculateCartTotals(cart, 50, 0, null, 0);

    // Subtotal: (275*2) + (145*3) = 550 + 435 = 985
    // Discount: 50
    // Grand Total: 985 - 50 = 935
    expect(totals.subtotal).toBe(985);
    expect(totals.calculatedDiscount).toBe(50);
    expect(totals.grandTotal).toBe(935);
    
    // Independently calculated taxable subtotal: 523.8095 + 414.2857 = 938.0952 -> 938.10
    expect(totals.taxableSubtotal).toBe(938.10);
    
    // Independently calculated output tax: 26.1905 + 20.7143 = 46.9048 -> 46.90
    expect(totals.taxAmount).toBe(46.90);

    // Assert that taxableSubtotal + taxAmount equals subtotal (938.10 + 46.90 = 985.00)
    expect(totals.taxableSubtotal + totals.taxAmount).toBe(totals.subtotal);
  });
});
