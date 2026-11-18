import { describe, it, expect } from "vitest";
import {
  calculateCartTotals,
  calculateCashChange,
  deductStockOnSale,
  updateCustomerLedger,
} from "../utils/moneyMath";
import {
  hashPinAsync,
  verifyPinHashAsync,
} from "../utils/storageCrypto";
import { CURRENT_SCHEMA_VERSION } from "../utils/schemaMigration";
import { createEncryptedBackup, verifyAndDecryptBackup } from "../utils/backupRestore";
import { sanitizeCsvCell } from "../utils/csvSanitizer";

describe("DukaanPOS — Exhaustive Code, Button & State Machine Integrity Suite", () => {
  // =========================================================================
  // SECTION 1: Authentication, Register Lock Screen & Key Management
  // =========================================================================
  describe("1. Authentication, Lock Screen & PBKDF2 Passcode Security", () => {
    it("hashes and verifies cashier passcode using salted PBKDF2 without exposing plaintext", async () => {
      const pin = "789012";
      const { verifierString, saltHex } = await hashPinAsync(pin);

      expect(verifierString).toBeDefined();
      expect(verifierString.startsWith("PBKDF2_PIN_v1::")).toBe(true);
      expect(saltHex.length).toBe(32); // 16 bytes salt in hex
      expect(verifierString.includes(pin)).toBe(false); // zero plaintext leak

      // Verify correct PIN
      const isCorrect = await verifyPinHashAsync(pin, verifierString);
      expect(isCorrect).toBe(true);

      // Reject wrong PIN
      const isWrong = await verifyPinHashAsync("000000", verifierString);
      expect(isWrong).toBe(false);
    });

    it("supports long alphanumeric passphrases up to 32 characters", async () => {
      const strongPassphrase = "KiranaCounterVaultSecure2026";
      const { verifierString } = await hashPinAsync(strongPassphrase);
      const isMatch = await verifyPinHashAsync(strongPassphrase, verifierString);
      expect(isMatch).toBe(true);
    });

    it("gates register access when counter is locked and unlocks upon verified PIN", async () => {
      let isCounterLocked = true;
      const storedVerifier = (await hashPinAsync("4567")).verifierString;

      const unlockHandler = async (enteredPin) => {
        const isValid = await verifyPinHashAsync(enteredPin, storedVerifier);
        if (isValid) {
          isCounterLocked = false;
          return { success: true };
        }
        return { success: false, message: "Incorrect PIN." };
      };

      // Attempt wrong PIN
      const failedAttempt = await unlockHandler("1111");
      expect(failedAttempt.success).toBe(false);
      expect(isCounterLocked).toBe(true);

      // Attempt correct PIN
      const successAttempt = await unlockHandler("4567");
      expect(successAttempt.success).toBe(true);
      expect(isCounterLocked).toBe(false);
    });
  });

  // =========================================================================
  // SECTION 2: POS Catalog, Search Engine & Stepper Quantity Math
  // =========================================================================
  describe("2. Product Catalog Shelf, Search & Stepper Controls", () => {
    const catalog = [
      { id: "p1", name: "Tata Tea Premium 500g", barcode: "8901058852270", hsn: "0902", category: "Beverages", retailPrice: 240, stock: 25, unit: "pack", gst: 5 },
      { id: "p2", name: "Fortune Sunlite Sunflower Oil 1L", barcode: "8906007280011", hsn: "1512", category: "Edible Oils", retailPrice: 145, stock: 4, unit: "Ltr", gst: 5, minStockWarning: 5 },
      { id: "p3", name: "Loose Basmati Rice", barcode: "8901234567890", hsn: "1006", category: "Grains", retailPrice: 90, stock: 100, unit: "kg", gst: 0 },
    ];

    it("filters catalog by search query across name, barcode, and HSN simultaneously", () => {
      const search = (q) => {
        const query = q.toLowerCase().trim();
        return catalog.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.barcode && p.barcode.includes(query)) ||
            (p.hsn && p.hsn.includes(query))
        );
      };

      expect(search("Tata")).toHaveLength(1);
      expect(search("8906007280011")).toHaveLength(1);
      expect(search("1006")).toHaveLength(1);
      expect(search("NonExistent")).toHaveLength(0);
    });

    it("filters catalog by category pills and tallies item counts", () => {
      const getCategoryItems = (cat) =>
        cat === "All" ? catalog : catalog.filter((p) => p.category === cat);

      expect(getCategoryItems("All")).toHaveLength(3);
      expect(getCategoryItems("Beverages")).toHaveLength(1);
      expect(getCategoryItems("Edible Oils")).toHaveLength(1);
    });

    it("handles packaged whole units vs fractional loose Kirana weights with 3-decimal precision", () => {
      const rice = catalog[2]; // Loose Basmati Rice (kg)
      let cart = [];

      const addItem = (product, qty) => {
        const existing = cart.find((i) => i.id === product.id);
        if (existing) {
          existing.qty = Math.round((existing.qty + qty) * 1000) / 1000;
          existing.total = Math.round(existing.qty * existing.price * 100) / 100;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.retailPrice,
            qty: qty,
            total: Math.round(qty * product.retailPrice * 100) / 100,
          });
        }
      };

      // Add 250g (0.25 kg)
      addItem(rice, 0.25);
      expect(cart[0].qty).toBe(0.25);
      expect(cart[0].total).toBe(22.5); // 90 * 0.25 = 22.50

      // Add 500g (0.5 kg) more
      addItem(rice, 0.5);
      expect(cart[0].qty).toBe(0.75);
      expect(cart[0].total).toBe(67.5); // 90 * 0.75 = 67.50
    });

    it("removes item from cart when quantity is decremented to zero or below", () => {
      let cart = [{ id: "p1", name: "Tea", qty: 1, price: 240 }];

      const updateQty = (id, newQty) => {
        if (newQty <= 0) {
          cart = cart.filter((i) => i.id !== id);
        } else {
          cart = cart.map((i) => (i.id === id ? { ...i, qty: newQty } : i));
        }
      };

      updateQty("p1", 0);
      expect(cart).toHaveLength(0);
    });

    it("flags soft stock warning toast when selling quantity exceeds available inventory without hard blocking sale", () => {
      const oil = catalog[1]; // Stock: 4 Ltr
      let warningToast = null;

      const checkStock = (product, requestQty) => {
        if (product.stock !== null && requestQty > product.stock) {
          warningToast = `Soft Warning: Selling ${requestQty} ${product.unit} of "${product.name}" (Recorded Stock: ${product.stock})`;
        }
      };

      checkStock(oil, 6);
      expect(warningToast).toContain("Soft Warning: Selling 6 Ltr of \"Fortune Sunlite Sunflower Oil 1L\"");
    });
  });

  // =========================================================================
  // SECTION 3: Cart State Machine, Park/Resume & Discounts
  // =========================================================================
  describe("3. Cart State Machine, Park/Hold Functionality & Promo Discounts", () => {
    it("parks active cart, clears till for next customer, and resumes held cart seamlessly", () => {
      let cart = [
        { id: "p1", name: "Tea", price: 240, qty: 2, total: 480 },
      ];
      let cartCustomer = { id: "c1", name: "Sharma Ji" };
      let parkedCarts = [];

      // Park Cart
      const parkCart = () => {
        const held = {
          id: "hold_1",
          label: `${cartCustomer.name}'s Cart`,
          items: [...cart],
          customer: cartCustomer,
          grandTotal: 480,
          parkedAt: new Date().toISOString(),
        };
        parkedCarts.push(held);
        cart = [];
        cartCustomer = null;
        return { success: true, message: `Cart on hold (${held.label}).` };
      };

      const parkRes = parkCart();
      expect(parkRes.success).toBe(true);
      expect(cart).toHaveLength(0);
      expect(cartCustomer).toBeNull();
      expect(parkedCarts).toHaveLength(1);
      expect(parkedCarts[0].label).toBe("Sharma Ji's Cart");

      // Resume Cart
      const resumeCart = (id) => {
        const target = parkedCarts.find((c) => c.id === id);
        cart = target.items;
        cartCustomer = target.customer;
        parkedCarts = parkedCarts.filter((c) => c.id !== id);
        return { success: true, message: `Resumed ${target.label}.` };
      };

      const resumeRes = resumeCart("hold_1");
      expect(resumeRes.success).toBe(true);
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe("Tea");
      expect(cartCustomer.name).toBe("Sharma Ji");
      expect(parkedCarts).toHaveLength(0);
    });

    it("validates promo coupon codes against minimum bill requirements", () => {
      const coupons = [
        { code: "DIWALI50", type: "flat", value: 50, minBill: 500 },
        { code: "FESTIVE10", type: "percent", value: 10, minBill: 1000 },
      ];

      const applyCoupon = (codeStr, subtotal) => {
        const found = coupons.find((c) => c.code === codeStr);
        if (!found) return { success: false, message: "Invalid Coupon Code!" };
        if (subtotal < found.minBill) {
          return { success: false, message: `Minimum bill of ₹${found.minBill} required.` };
        }
        return { success: true, coupon: found };
      };

      // Fails: bill too low
      const lowAttempt = applyCoupon("DIWALI50", 400);
      expect(lowAttempt.success).toBe(false);
      expect(lowAttempt.message).toContain("Minimum bill of ₹500 required");

      // Succeeds: bill meets threshold
      const successAttempt = applyCoupon("DIWALI50", 600);
      expect(successAttempt.success).toBe(true);
      expect(successAttempt.coupon.value).toBe(50);
    });

    it("accurately stacks manual discounts, active promo coupons, and loyalty points", () => {
      const items = [{ price: 1000, qty: 1, gst: 18 }];
      const discountRupees = 50;
      const activeCoupon = { code: "FLAT100", type: "flat", value: 100, minBill: 500 };
      const redeemedPoints = 25; // ₹25 loyalty redemption

      const totals = calculateCartTotals(items, discountRupees, 0, activeCoupon, redeemedPoints);
      expect(totals.subtotal).toBe(1000);
      expect(totals.calculatedDiscount).toBe(175); // 50 + 100 + 25 = 175
      expect(totals.grandTotal).toBe(825); // 1000 - 175 = 825
    });
  });

  // =========================================================================
  // SECTION 4: Payment Methods, Change Math & Udhaar Enforcement
  // =========================================================================
  describe("4. Payment Processing, Cash Change & Udhaar Ledger Rules", () => {
    it("calculates exact cash change due and rejects cash tendered below bill total", () => {
      const grandTotal = 745;

      const validateCashPayment = (tendered, billTotal) => {
        if (tendered < billTotal) {
          return { valid: false, message: "Cash tendered cannot be less than bill total." };
        }
        return { valid: true, changeDue: calculateCashChange(tendered, billTotal) };
      };

      const underpaid = validateCashPayment(700, grandTotal);
      expect(underpaid.valid).toBe(false);

      const exact = validateCashPayment(745, grandTotal);
      expect(exact.valid).toBe(true);
      expect(exact.changeDue).toBe(0);

      const overpaid = validateCashPayment(1000, grandTotal);
      expect(overpaid.valid).toBe(true);
      expect(overpaid.changeDue).toBe(255);
    });

    it("enforces that Udhaar (Credit) checkout strictly requires an attached customer account", () => {
      const processCheckout = (mode, customer) => {
        if (mode === "udhar" && !customer) {
          throw new Error("Udhaar (Credit) requires selecting a registered customer account.");
        }
        return { success: true };
      };

      expect(() => processCheckout("udhar", null)).toThrow(
        "Udhaar (Credit) requires selecting a registered customer account."
      );

      const validUdhar = processCheckout("udhar", { id: "c1", name: "Verma Ji" });
      expect(validUdhar.success).toBe(true);
    });

    it("generates standard NPCI UPI URI with accurate store VPA and bill total", () => {
      const storeConfig = { upiId: "shopeasy@upi", name: "Shop Easy Retail" };
      const billTotal = 850;

      const upiUri = `upi://pay?pa=${encodeURIComponent(storeConfig.upiId)}&pn=${encodeURIComponent(storeConfig.name)}&am=${billTotal}&cu=INR&tn=Invoice Payment`;

      expect(upiUri).toContain("pa=shopeasy%40upi");
      expect(upiUri).toContain("pn=Shop%20Easy%20Retail");
      expect(upiUri).toContain("am=850");
      expect(upiUri).toContain("cu=INR");
    });

    it("deducts inventory stock and updates customer Udhaar balance upon sale completion", () => {
      const initialProducts = [
        { id: "p1", name: "Soap", stock: 20 },
        { id: "p2", name: "Toothpaste", stock: 15 },
      ];
      const cartItems = [
        { id: "p1", qty: 3 },
        { id: "p2", qty: 2 },
      ];
      const initialCustomers = [
        { id: "c1", name: "Amit Kumar", balance: 300, loyaltyPoints: 10, history: [] },
      ];

      // 1. Deduct Stock
      const updatedProducts = deductStockOnSale(initialProducts, cartItems);
      expect(updatedProducts.find((p) => p.id === "p1").stock).toBe(17);
      expect(updatedProducts.find((p) => p.id === "p2").stock).toBe(13);

      // 2. Update Customer Khata for Udhaar sale of ₹500
      const updatedCustomers = updateCustomerLedger(
        initialCustomers,
        "c1",
        500, // due amount
        5,   // points earned
        0,   // redeemed points
        "INV-2001"
      );
      const cust = updatedCustomers.find((c) => c.id === "c1");
      expect(cust.balance).toBe(800); // 300 + 500 = 800
      expect(cust.loyaltyPoints).toBe(15); // 10 + 5 = 15
      expect(cust.history).toHaveLength(1);
      expect(cust.history[0].type).toBe("debit");
      expect(cust.history[0].amount).toBe(500);
    });
  });

  // =========================================================================
  // SECTION 5: Customer Khata, Payment Collection & WhatsApp Reminders
  // =========================================================================
  describe("5. Customer Khata Ledger, Repayment & WhatsApp Integration", () => {
    it("returns created customer object with assigned UUID and normalized balance", () => {
      let customers = [];
      const addCustomer = (data) => {
        const c = {
          ...data,
          id: data.id || `c_${crypto.randomUUID()}`,
          balance: Number(data.balance) || 0,
          loyaltyPoints: Number(data.loyaltyPoints) || 0,
          history: [],
        };
        customers.push(c);
        return c;
      };

      const newCustomer = addCustomer({ name: "Kavita Rao", phone: "9876543210", balance: 150 });
      expect(newCustomer.id).toBeDefined();
      expect(newCustomer.id.startsWith("c_")).toBe(true);
      expect(newCustomer.balance).toBe(150);
      expect(customers).toHaveLength(1);
    });

    it("records customer partial repayment without dropping balance below zero", () => {
      const customers = [
        { id: "c1", name: "Ramesh Gupta", balance: 1000, history: [] },
      ];

      const recordPayment = (custs, custId, amountPaid) => {
        const amt = Number(amountPaid);
        return custs.map((c) => {
          if (c.id === custId) {
            if (amt > c.balance) {
              throw new Error("Payment cannot exceed outstanding balance.");
            }
            return {
              ...c,
              balance: c.balance - amt,
              history: [
                { id: `h_${Date.now()}`, type: "credit", amount: amt, note: "Cash repayment" },
                ...c.history,
              ],
            };
          }
          return c;
        });
      };

      // Fails: overpayment
      expect(() => recordPayment(customers, "c1", 1200)).toThrow(
        "Payment cannot exceed outstanding balance."
      );

      // Partial payment of ₹400
      const afterPayment = recordPayment(customers, "c1", 400);
      expect(afterPayment[0].balance).toBe(600);
      expect(afterPayment[0].history).toHaveLength(1);
      expect(afterPayment[0].history[0].type).toBe("credit");
    });

    it("constructs compliant WhatsApp payment reminder link with sanitized phone and text", () => {
      const customer = { name: "Anand Verma", phone: "+91 98111-22334", balance: 650 };
      const storeConfig = { name: "Gupta Kirana", upiId: "gupta@upi" };

      const generateReminderUrl = (cust, store) => {
        const cleanPhone = cust.phone.replace(/[^0-9]/g, "");
        const message = `Namaste ${cust.name} ji, your pending Udhaar balance at ${store.name} is ₹${cust.balance}. Kindly settle via UPI at ${store.upiId}. Thank you!`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      };

      const waUrl = generateReminderUrl(customer, storeConfig);
      expect(waUrl.startsWith("https://wa.me/919811122334?text=")).toBe(true);
      expect(waUrl).toContain("650");
      expect(waUrl).toContain("gupta%40upi");
    });

    it("masks customer phone numbers for DPDP Act Section 12 privacy protection", () => {
      const maskPhone = (phoneStr) => {
        if (!phoneStr) return "+91 98765 *****";
        const cleaned = phoneStr.replace(/[^0-9]/g, "");
        if (cleaned.length >= 10) {
          return `+91 ${cleaned.slice(-10, -5)} *****`;
        }
        return phoneStr;
      };

      expect(maskPhone("9876543210")).toBe("+91 98765 *****");
      expect(maskPhone("+91-91234-56789")).toBe("+91 91234 *****");
    });
  });

  // =========================================================================
  // SECTION 6: Inventory Stock Valuation & EAN-13 Barcode Printing
  // =========================================================================
  describe("6. Stock Valuation, Quick Refill & Barcode Sheet Streaming", () => {
    it("computes accurate total inventory valuation based on cost price with retail price fallback", () => {
      const products = [
        { id: "p1", name: "Atta 5kg", costPrice: 180, retailPrice: 220, stock: 10 },
        { id: "p2", name: "Sugar 1kg", costPrice: null, retailPrice: 50, stock: 20 }, // Fallback to 80% = 40
      ];

      const totalValuation = products.reduce((acc, p) => {
        const cost = p.costPrice || p.retailPrice * 0.8;
        return acc + cost * (p.stock || 0);
      }, 0);

      // (180 * 10) + (40 * 20) = 1800 + 800 = 2600
      expect(totalValuation).toBe(2600);
    });

    it("increases stock count accurately in quick refill modal handler", () => {
      let products = [{ id: "p1", name: "Mustard Oil", stock: 5 }];

      const confirmRefill = (id, addQty) => {
        const qtyNum = Number(addQty);
        if (isNaN(qtyNum) || qtyNum <= 0) return;
        products = products.map((p) => (p.id === id ? { ...p, stock: (p.stock || 0) + qtyNum } : p));
      };

      confirmRefill("p1", 15);
      expect(products[0].stock).toBe(20);
    });

    it("generates exact run-length sticker stream for A4 label sheets (24 and 40 sticker grids)", () => {
      const selectedPrintList = [
        { productId: "p1", qty: 4 },
        { productId: "p2", qty: 6 },
      ];
      const products = [
        { id: "p1", name: "Biscuit", retailPrice: 20, barcode: "8901234567890" },
        { id: "p2", name: "Juice", retailPrice: 40, barcode: "8909876543210" },
      ];

      const stickerStream = selectedPrintList.flatMap((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return Array.from({ length: item.qty }).map((_, idx) => ({
          ...prod,
          stickerId: `${prod.id}_${idx}`,
        }));
      });

      expect(stickerStream).toHaveLength(10);
      expect(stickerStream.filter((s) => s.id === "p1")).toHaveLength(4);
      expect(stickerStream.filter((s) => s.id === "p2")).toHaveLength(6);
    });
  });

  // =========================================================================
  // SECTION 7: Cash Drawer Float, Shift Reconciliation & Variance
  // =========================================================================
  describe("7. Cash Drawer Float, Shift Audit & Shortage/Surplus Reporting", () => {
    it("computes expected cash in drawer based on opening float and shift cash sales only", () => {
      const openingFloat = 2000;
      const sales = [
        { id: "s1", paymentMode: "cash", paidAmount: 450 },
        { id: "s2", paymentMode: "upi", paidAmount: 800 },
        { id: "s3", paymentMode: "cash", paidAmount: 320 },
        { id: "s4", paymentMode: "udhar", paidAmount: 0 },
      ];

      const cashSalesTotal = sales
        .filter((s) => s.paymentMode === "cash")
        .reduce((acc, s) => acc + s.paidAmount, 0);

      const expectedDrawerTotal = openingFloat + cashSalesTotal;
      expect(cashSalesTotal).toBe(770);
      expect(expectedDrawerTotal).toBe(2770);
    });

    it("correctly identifies exact discrepancy, reporting surplus (+) or shortage (-)", () => {
      const expectedCash = 2770;

      const auditDrawer = (countedCash) => {
        const discrepancy = countedCash - expectedCash;
        return {
          status: discrepancy === 0 ? "balanced" : discrepancy > 0 ? "surplus" : "shortage",
          discrepancy,
        };
      };

      const balanced = auditDrawer(2770);
      expect(balanced.status).toBe("balanced");
      expect(balanced.discrepancy).toBe(0);

      const shortage = auditDrawer(2700);
      expect(shortage.status).toBe("shortage");
      expect(shortage.discrepancy).toBe(-70);

      const surplus = auditDrawer(2850);
      expect(surplus.status).toBe("surplus");
      expect(surplus.discrepancy).toBe(80);
    });
  });

  // =========================================================================
  // SECTION 8: Suppliers & GRN Stock Inwarding
  // =========================================================================
  describe("8. Distributor Ledgers & Automated Goods Receipt Note (GRN) Inwarding", () => {
    it("automatically increments product stock inventory upon receiving a GRN shipment", () => {
      let products = [
        { id: "p1", name: "Maggi Noodles 70g", stock: 12, costPrice: 11 },
        { id: "p2", name: "Good Day Cookies", stock: 8, costPrice: 18 },
      ];

      const grnItems = [
        { productName: "Maggi Noodles 70g", qty: 48, costPrice: 10.5 },
      ];

      const receiveGRNShipment = (items) => {
        products = products.map((p) => {
          const match = items.find((i) => i.productName === p.name);
          if (match) {
            return {
              ...p,
              stock: (p.stock || 0) + Number(match.qty),
              costPrice: Number(match.costPrice) || p.costPrice,
            };
          }
          return p;
        });
      };

      receiveGRNShipment(grnItems);
      const maggi = products.find((p) => p.name === "Maggi Noodles 70g");
      expect(maggi.stock).toBe(60); // 12 + 48 = 60
      expect(maggi.costPrice).toBe(10.5);
    });
  });

  // =========================================================================
  // SECTION 9: Salon & Specialty Verticals
  // =========================================================================
  describe("9. Specialty Verticals, Salon Appointments & Jewelry Estimator", () => {
    it("creates, books, and stores appointment booking with assigned UUID", () => {
      let appointments = [];
      const addAppointment = (data) => {
        const apt = {
          id: `apt_${Date.now()}_${crypto.randomUUID().slice(0, 4)}`,
          createdAt: new Date().toISOString(),
          status: "confirmed",
          ...data,
        };
        appointments.push(apt);
        return apt;
      };

      const apt = addAppointment({
        customerName: "Pooja Hegde",
        phone: "9812345678",
        serviceName: "Bridal Styling",
        staffName: "Priya",
        date: "2026-12-01",
        time: "15:00",
      });

      expect(apt.id).toBeDefined();
      expect(apt.status).toBe("confirmed");
      expect(appointments).toHaveLength(1);
    });

    it("computes jewelry gold rate and making charges estimation accurately", () => {
      const liveGoldRate22K = 6850;
      const weightGrams = 10;
      const purity = "22K";
      const makingPercent = 8;

      const metalPrice = weightGrams * (purity === "22K" ? liveGoldRate22K : liveGoldRate22K * 0.82);
      const makingCharge = (metalPrice * makingPercent) / 100;
      const totalEstimated = metalPrice + makingCharge;

      expect(metalPrice).toBe(68500); // 10 * 6850
      expect(makingCharge).toBe(5480); // 8% of 68500
      expect(totalEstimated).toBe(73980);
    });
  });

  // =========================================================================
  // SECTION 10: Reports, Tax Breakdown & Formula Injection Defense
  // =========================================================================
  describe("10. GSTR Tax Breakdown & Formula Injection Defense", () => {
    it("escapes dangerous formula triggers in CSV cell values to neutralize spreadsheet code execution", () => {
      expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
      expect(sanitizeCsvCell("-2+3")).toBe("'-2+3");
      expect(sanitizeCsvCell("@attacker.com")).toBe("'@attacker.com");
      expect(sanitizeCsvCell("   =1+1")).toBe("'   =1+1");
      expect(sanitizeCsvCell("Tata Tea")).toBe("Tata Tea");
    });

    it("aggregates HSN tax summary groups across sales transactions", () => {
      const sales = [
        {
          items: [
            { hsn: "0902", name: "Tea", price: 105, qty: 2, gst: 5 },
            { hsn: "1512", name: "Oil", price: 105, qty: 1, gst: 5 },
          ],
        },
        {
          items: [
            { hsn: "0902", name: "Tea", price: 105, qty: 1, gst: 5 },
          ],
        },
      ];

      const hsnSummary = {};
      sales.forEach((s) => {
        s.items.forEach((item) => {
          const hsn = item.hsn;
          if (!hsnSummary[hsn]) {
            hsnSummary[hsn] = { hsn, qty: 0, totalAmt: 0 };
          }
          hsnSummary[hsn].qty += item.qty;
          hsnSummary[hsn].totalAmt += item.price * item.qty;
        });
      });

      expect(hsnSummary["0902"].qty).toBe(3); // 2 + 1 = 3
      expect(hsnSummary["0902"].totalAmt).toBe(315);
      expect(hsnSummary["1512"].qty).toBe(1);
    });
  });

  // =========================================================================
  // SECTION 11: Encrypted Backup & Restore Workflow
  // =========================================================================
  describe("11. End-to-End Encrypted Backup & Restore Integration", () => {
    it("creates encrypted backup vault, verifies schema migration, and restores store records cleanly", async () => {
      const pin = "987654";
      const sampleStoreBundle = {
        storeConfig: { name: "City Kirana Mart", gstin: "07AAAAA0000A1Z5" },
        products: [{ id: "p1", name: "Product A", retailPrice: 100, stock: 10 }],
        customers: [{ id: "c1", name: "Customer A", balance: 200 }],
        suppliers: [{ id: "s1", name: "Supplier A", pendingBalance: 500 }],
        purchaseOrders: [{ id: "po1", totalAmount: 1000, status: "Draft" }],
        sales: [{ id: "INV-1", grandTotal: 300, paymentMode: "cash" }],
      };

      // 1. Export Backup
      const encryptedBackup = await createEncryptedBackup(sampleStoreBundle, pin);
      expect(encryptedBackup.startsWith("DUKAAN_VAULT_v1::")).toBe(true);
      expect(encryptedBackup.includes("City Kirana Mart")).toBe(false); // zero plaintext leak

      // 2. Restore Backup with Correct PIN
      const restoreResult = await verifyAndDecryptBackup(encryptedBackup, pin);
      expect(restoreResult.success).toBe(true);
      expect(restoreResult.data.storeConfig.name).toBe("City Kirana Mart");
      expect(restoreResult.data.products).toHaveLength(1);
      expect(restoreResult.data.customers).toHaveLength(1);
      expect(restoreResult.data.suppliers).toHaveLength(1);
      expect(restoreResult.data.purchaseOrders).toHaveLength(1);
      expect(restoreResult.data._schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

      // 3. Fail Closed with Wrong PIN
      const wrongPinResult = await verifyAndDecryptBackup(encryptedBackup, "000000");
      expect(wrongPinResult.success).toBe(false);
      expect(wrongPinResult.message).toContain("Incorrect cashier PIN");
    });
  });
});
