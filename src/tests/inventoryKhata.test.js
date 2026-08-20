import { describe, it, expect } from "vitest";
import { deductStockOnSale, updateCustomerLedger } from "../utils/moneyMath";

describe("Production Inventory & Customer Khata (src/utils/moneyMath.js)", () => {
  it("deducts stock quantity on sale without dropping below zero", () => {
    const products = [
      { id: "p1", name: "Atta", stock: 10 },
      { id: "p2", name: "Sugar", stock: 2 },
    ];
    const cart = [
      { id: "p1", qty: 3 },
      { id: "p2", qty: 5 },
    ];

    const updated = deductStockOnSale(products, cart);
    expect(updated.find((p) => p.id === "p1").stock).toBe(7);
    expect(updated.find((p) => p.id === "p2").stock).toBe(0); // Floored at 0
  });

  it("updates customer Udhaar balance with exact unpaid due (prevents double-counting)", () => {
    const customers = [
      {
        id: "c1",
        name: "Ramesh Sharma",
        balance: 500,
        loyaltyPoints: 10,
        history: [],
      },
    ];

    // Scenario: Bill Grand Total = ₹1000, Customer pays ₹700 Cash, Due = ₹300
    const updated = updateCustomerLedger(
      customers,
      "c1",
      300, // exact unpaid dueAmount
      10,  // pointsEarned
      0,   // redeemedPoints
      "INV-1001"
    );

    const c1 = updated.find((c) => c.id === "c1");
    // New Balance should be initial (500) + unpaid due (300) = 800 (NOT 500 + 1000 = 1500)
    expect(c1.balance).toBe(800);
    expect(c1.loyaltyPoints).toBe(20);
    expect(c1.history.length).toBe(1);
    expect(c1.history[0].amount).toBe(300);
    expect(c1.history[0].id).toMatch(/^h_/);
  });
});
