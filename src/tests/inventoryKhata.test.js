import { describe, it, expect } from "vitest";

// Pure Helper Logic for Inventory & Khata
export const deductStockOnSale = (products, cartItems) => {
  return products.map((p) => {
    const itemInCart = cartItems.find((c) => c.id === p.id);
    if (itemInCart && p.stock !== null) {
      return { ...p, stock: Math.max(0, p.stock - itemInCart.qty) };
    }
    return p;
  });
};

export const updateCustomerLedger = (customer, type, amount, note) => {
  const numAmt = Number(amount);
  const newBalance =
    type === "debit"
      ? (customer.balance || 0) + numAmt
      : Math.max(0, (customer.balance || 0) - numAmt);

  const newHistory = [
    {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      type,
      amount: numAmt,
      note,
    },
    ...(customer.history || []),
  ];

  return { ...customer, balance: newBalance, history: newHistory };
};

describe("Inventory Stock & Khata Ledger Unit Tests", () => {
  it("should correctly deduct stock quantities upon completing a sale", () => {
    const products = [
      { id: "1", name: "Aashirvaad Atta", stock: 20 },
      { id: "2", name: "Fortune Mustard Oil", stock: 15 },
    ];

    const cart = [
      { id: "1", qty: 3 },
      { id: "2", qty: 5 },
    ];

    const updated = deductStockOnSale(products, cart);
    expect(updated[0].stock).toBe(17);
    expect(updated[1].stock).toBe(10);
  });

  it("should accurately update Khata customer ledger debit (Udhaar) and credit (Payment)", () => {
    const customer = { id: "c1", name: "Ramesh Sharma", balance: 500, history: [] };

    // Record Udhaar Bill of ₹300
    const afterDebit = updateCustomerLedger(customer, "debit", 300, "Udhaar Invoice #1024");
    expect(afterDebit.balance).toBe(800);

    // Record Payment of ₹500
    const afterCredit = updateCustomerLedger(afterDebit, "credit", 500, "Paid via PhonePe");
    expect(afterCredit.balance).toBe(300);
  });
});
