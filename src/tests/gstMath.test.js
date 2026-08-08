import { describe, it, expect } from "vitest";

// Pure GST & Money Math Helper Functions
export const calculateGstSplit = (amountIncTax, gstPercent) => {
  const taxableVal = amountIncTax / (1 + gstPercent / 100);
  const totalTax = amountIncTax - taxableVal;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  return {
    taxableVal: Math.round(taxableVal * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
  };
};

export const calculateCartTotals = (items, discountRs = 0, discountPct = 0) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  let discount = 0;
  if (discountRs > 0) {
    discount = discountRs;
  } else if (discountPct > 0) {
    discount = (subtotal * discountPct) / 100;
  }

  const grandTotal = Math.max(0, Math.round(subtotal - discount));
  return { subtotal, discount, grandTotal };
};

describe("GST Tax & Money Math Unit Tests", () => {
  it("should accurately calculate 5% GST CGST/SGST split for ₹105 inclusive item", () => {
    const res = calculateGstSplit(105, 5);
    expect(res.taxableVal).toBe(100);
    expect(res.totalTax).toBe(5);
    expect(res.cgst).toBe(2.5);
    expect(res.sgst).toBe(2.5);
  });

  it("should accurately calculate 18% GST CGST/SGST split for ₹118 inclusive item", () => {
    const res = calculateGstSplit(118, 18);
    expect(res.taxableVal).toBe(100);
    expect(res.totalTax).toBe(18);
    expect(res.cgst).toBe(9);
    expect(res.sgst).toBe(9);
  });

  it("should correctly compute cart subtotal, discount, and grand total", () => {
    const items = [
      { price: 145, qty: 2 }, // 290
      { price: 275, qty: 1 }, // 275
    ];
    // subtotal = 565

    const resWithFlatDiscount = calculateCartTotals(items, 65, 0);
    expect(resWithFlatDiscount.subtotal).toBe(565);
    expect(resWithFlatDiscount.discount).toBe(65);
    expect(resWithFlatDiscount.grandTotal).toBe(500);

    const resWithPctDiscount = calculateCartTotals(items, 0, 10);
    expect(resWithPctDiscount.subtotal).toBe(565);
    expect(resWithPctDiscount.discount).toBe(56.5);
    expect(resWithPctDiscount.grandTotal).toBe(509);
  });
});
