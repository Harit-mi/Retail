/**
 * DukaanPOS — Production Money Math & Ledger Utilities
 * Pure functions exported for both StoreContext.jsx runtime and Vitest unit testing.
 */

// 1. Calculate GST Split (Intra-state CGST+SGST / Inter-state IGST)
export const calculateGstSplit = (price, gstRate = 5, isInterState = false) => {
  const priceNum = Number(price) || 0;
  const gstNum = Number(gstRate) || 0;
  
  const taxableAmount = Math.round((priceNum / (1 + gstNum / 100)) * 100) / 100;
  const totalTax = Math.round((priceNum - taxableAmount) * 100) / 100;

  if (isInterState) {
    return {
      taxableAmount,
      totalTax,
      cgst: 0,
      sgst: 0,
      igst: totalTax,
    };
  }

  const halfTax = Math.round((totalTax / 2) * 100) / 100;
  return {
    taxableAmount,
    totalTax,
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
  };
};

// 2. Calculate Cart Totals & Reconciled GST Tax Rounding
export const calculateCartTotals = (
  cartItems = [],
  discountRupees = 0,
  discountPercent = 0,
  activeCoupon = null,
  redeemedPoints = 0
) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);

  const taxDetails = cartItems.reduce(
    (acc, item) => {
      const itemTotal = (item.price || 0) * (item.qty || 1);
      const gst = item.gst || 0;
      const taxableVal = itemTotal / (1 + gst / 100);
      const taxVal = itemTotal - taxableVal;
      acc.taxableAmount += taxableVal;
      acc.totalTax += taxVal;
      return acc;
    },
    { taxableAmount: 0, totalTax: 0 }
  );

  /*
   * NOTE (Intentional Design Choice):
   * Discount stacking in Kirana retail billing is CUMULATIVE by design.
   * Direct manual discount + promo coupon + loyalty points redemption.
   */
  let calculatedDiscount = 0;

  if (discountRupees > 0) {
    calculatedDiscount = discountRupees;
  } else if (discountPercent > 0) {
    calculatedDiscount = (subtotal * discountPercent) / 100;
  }

  if (activeCoupon) {
    if (activeCoupon.type === "percent") {
      calculatedDiscount += (subtotal * activeCoupon.value) / 100;
    } else {
      calculatedDiscount += activeCoupon.value;
    }
  }

  if (redeemedPoints > 0) {
    calculatedDiscount += redeemedPoints;
  }

  const grandTotal = Math.max(0, Math.round(subtotal - calculatedDiscount));

  // Reconciled Tax Rounding: subtotal + taxAmount === grandTotal ALWAYS
  const exactTaxAmount = Math.round(taxDetails.totalTax * 100) / 100;
  const exactTaxableSubtotal = Math.round((grandTotal - exactTaxAmount) * 100) / 100;

  return {
    subtotal,
    calculatedDiscount,
    grandTotal,
    taxableSubtotal: exactTaxableSubtotal,
    taxAmount: exactTaxAmount,
  };
};

// 3. Deduct Stock Inventory on Sale
export const deductStockOnSale = (products = [], cartItems = []) => {
  return products.map((p) => {
    const cartItem = cartItems.find((item) => item.id === p.id);
    if (cartItem && p.stock !== null && p.stock !== undefined) {
      return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
    }
    return p;
  });
};

// 4. Update Customer Ledger & Loyalty Points (Prevents Udhaar Double Counting)
export const updateCustomerLedger = (
  customers = [],
  customerId = null,
  dueAmount = 0,
  pointsEarned = 0,
  redeemedPoints = 0,
  invNumber = ""
) => {
  if (!customerId) return customers;

  return customers.map((c) => {
    if (c.id === customerId) {
      const addedDue = dueAmount; // Correctly uses remaining unpaid due
      const updatedPoints = Math.max(
        0,
        (c.loyaltyPoints || 0) - redeemedPoints + pointsEarned
      );
      const newHistoryItem =
        addedDue > 0
          ? [
              {
                id: `h_${crypto.randomUUID()}`,
                date: new Date().toISOString().split("T")[0],
                type: "debit",
                amount: addedDue,
                note: `Bill #${invNumber} (Partial/Udhaar Dues)`,
              },
            ]
          : [];

      return {
        ...c,
        balance: c.balance + addedDue,
        loyaltyPoints: updatedPoints,
        history: [...newHistoryItem, ...(c.history || [])],
      };
    }
    return c;
  });
};
