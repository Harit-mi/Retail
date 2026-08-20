import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialProducts,
  initialCustomers,
  initialSalesHistory,
  initialStoreConfig,
  initialSuppliers,
  initialPurchaseOrders,
  initialCoupons,
} from "../data/sampleData";
import { translations } from "../i18n/translations";

const StoreContext = createContext();

// Helper: Safe LocalStorage JSON parser with try/catch fallback
const getSafeStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}", falling back to initial default.`, e);
    return fallback;
  }
};

export const StoreProvider = ({ children }) => {
  // Language i18n
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("dukaan_language") || "en";
  });

  const t = (key) => {
    const langDict = translations[currentLanguage] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem("dukaan_language", langCode);
  };

  // Store Config & Settings
  const [storeConfig, setStoreConfig] = useState(() =>
    getSafeStorage("dukaan_store_config", initialStoreConfig)
  );

  // Products
  const [products, setProducts] = useState(() =>
    getSafeStorage("dukaan_products", initialProducts)
  );

  // Customers (Khata / Udhaar Book + Loyalty)
  const [customers, setCustomers] = useState(() =>
    getSafeStorage("dukaan_customers", initialCustomers)
  );

  // Suppliers & Purchase Orders
  const [suppliers, setSuppliers] = useState(() =>
    getSafeStorage("dukaan_suppliers", initialSuppliers)
  );

  const [purchaseOrders, setPurchaseOrders] = useState(() =>
    getSafeStorage("dukaan_purchase_orders", initialPurchaseOrders)
  );

  // Coupons & Loyalty Points
  const [coupons] = useState(initialCoupons);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  // Sales History
  const [sales, setSales] = useState(() =>
    getSafeStorage("dukaan_sales", initialSalesHistory)
  );

  // Active Vertical Filter
  const [activeVertical, setActiveVertical] = useState("all");

  // POS Cart & Soft Warnings
  const [cart, setCart] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountRupees, setDiscountRupees] = useState(0);
  const [stockWarningToast, setStockWarningToast] = useState(null);

  // App Navigation & UI States
  const [activeTab, setActiveTab] = useState("pos"); // Default Kirana Counter POS Billing
  const [printableBill, setPrintableBill] = useState(null);
  const [printFormat, setPrintFormat] = useState("thermal");

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("dukaan_store_config", JSON.stringify(storeConfig));
  }, [storeConfig]);

  useEffect(() => {
    localStorage.setItem("dukaan_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("dukaan_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("dukaan_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("dukaan_purchase_orders", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("dukaan_sales", JSON.stringify(sales));
  }, [sales]);

  // Cart Operations with Soft Stock Warning
  const addToCart = (product, qty = 1, customAttributes = {}) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      let newQty = qty;

      if (existingIndex > -1) {
        const updated = [...prevCart];
        newQty = updated[existingIndex].qty + qty;
        if (newQty <= 0) {
          return prevCart.filter((item) => item.id !== product.id);
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          total: newQty * updated[existingIndex].price,
        };
        
        // Soft Stock Warning Check
        if (product.stock !== null && newQty > product.stock) {
          setStockWarningToast(`Soft Warning: Selling ${newQty} ${product.unit} of "${product.name}" (Recorded Stock: ${product.stock})`);
          setTimeout(() => setStockWarningToast(null), 3500);
        }
        return updated;
      } else {
        // Soft Stock Warning Check
        if (product.stock !== null && qty > product.stock) {
          setStockWarningToast(`Soft Warning: Selling ${qty} ${product.unit} of "${product.name}" (Recorded Stock: ${product.stock})`);
          setTimeout(() => setStockWarningToast(null), 3500);
        }

        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            hsn: product.hsn,
            price: product.retailPrice,
            costPrice: product.costPrice || product.retailPrice * 0.8,
            gst: product.gst || 0,
            unit: product.unit || "Pcs",
            stock: product.stock,
            minStockWarning: product.minStockWarning || 5,
            selling_unit_type: product.selling_unit_type || "piece",
            vertical: product.vertical || "kirana",
            attributes: { ...(product.attributes || {}), ...customAttributes },
            qty: qty,
            total: product.retailPrice * qty,
          },
        ];
      }
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && prod.stock !== null && newQty > prod.stock) {
      setStockWarningToast(`Soft Warning: Selling ${newQty} ${prod.unit} of "${prod.name}" (Recorded Stock: ${prod.stock})`);
      setTimeout(() => setStockWarningToast(null), 3500);
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, qty: newQty, total: newQty * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartCustomer(null);
    setDiscountPercent(0);
    setDiscountRupees(0);
    setActiveCoupon(null);
    setRedeemedPoints(0);
  };

  // Cart Totals & Coupon / Loyalty Math
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const cartTaxDetails = cart.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.qty;
      const taxableVal = itemTotal / (1 + item.gst / 100);
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
   * Shopkeepers can apply a direct manual discount (rupee or percent) PLUS a seasonal
   * promo coupon (e.g. DIWALI10) PLUS customer loyalty points redemption.
   * The final payable bill is floored at 0 rupees via Math.max(0, ...).
   */
  let calculatedDiscount = 0;

  // 1. Direct Manual Discount (Rupees or Percent)
  if (discountRupees > 0) {
    calculatedDiscount = discountRupees;
  } else if (discountPercent > 0) {
    calculatedDiscount = (cartSubtotal * discountPercent) / 100;
  }

  // 2. Promo Coupon Code Discount
  if (activeCoupon) {
    if (activeCoupon.type === "percent") {
      calculatedDiscount += (cartSubtotal * activeCoupon.value) / 100;
    } else {
      calculatedDiscount += activeCoupon.value;
    }
  }

  // 3. Loyalty Points Redemption (1 Point = ₹1)
  if (redeemedPoints > 0) {
    calculatedDiscount += redeemedPoints;
  }

  const cartGrandTotal = Math.max(0, Math.round(cartSubtotal - calculatedDiscount));

  // Apply Coupon Helper
  const applyCouponCode = (codeStr) => {
    const code = codeStr.toUpperCase().trim();
    const found = coupons.find((c) => c.code === code);
    if (!found) {
      return { success: false, message: "Invalid Coupon Code!" };
    }
    if (cartSubtotal < found.minBill) {
      return {
        success: false,
        message: `Minimum bill of ₹${found.minBill} required for ${found.code}`,
      };
    }
    setActiveCoupon(found);
    return { success: true, message: `Coupon ${found.code} Applied Successfully!` };
  };

  // Complete Sale / Checkout with Exact Tax & Subtotal Reconciled Rounding
  const completeCheckout = (paymentDetails) => {
    const invNumber = `INV-${1000 + sales.length + 1}`;
    const now = new Date().toISOString();
    
    // Calculate exact remaining unpaid due balance
    const paid = Number(paymentDetails.paidAmount) || 0;
    const due = Math.max(0, cartGrandTotal - paid);

    // Calculate Loyalty Points Earned (1 point per ₹100 spent)
    const pointsEarned = Math.floor(cartGrandTotal / 100);

    // Tax Reconciled Rounding: Taxable Base = GrandTotal - TotalTax
    const exactTaxAmount = Math.round(cartTaxDetails.totalTax * 100) / 100;
    const exactTaxableSubtotal = Math.round((cartGrandTotal - exactTaxAmount) * 100) / 100;

    const newInvoice = {
      id: invNumber,
      date: now,
      customerName: cartCustomer ? cartCustomer.name : t("walkInCustomer"),
      customerPhone: cartCustomer ? cartCustomer.phone : "",
      customerId: cartCustomer ? cartCustomer.id : null,
      items: [...cart],
      subtotal: exactTaxableSubtotal,
      taxAmount: exactTaxAmount,
      discount: Math.round(calculatedDiscount * 100) / 100,
      grandTotal: cartGrandTotal,
      paymentMode: paymentDetails.mode,
      paidAmount: paid,
      dueAmount: due,
      pointsEarned: pointsEarned,
      operator: storeConfig.ownerName || "Cashier",
    };

    // 1. Deduct Stock Inventory
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);
        if (cartItem && p.stock !== null && p.stock !== undefined) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      })
    );

    // 2. Update Customer Ledger & Loyalty Points
    if (cartCustomer) {
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => {
          if (c.id === cartCustomer.id) {
            const addedDue = due;
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
        })
      );
    }

    // 3. Add to Sales Log
    setSales((prev) => [newInvoice, ...prev]);

    // 4. Printable Invoice
    setPrintableBill(newInvoice);

    // 5. Clear Cart
    clearCart();

    return newInvoice;
  };

  // Supplier & Goods Receipt Note (GRN) Management
  const addSupplier = (supData) => {
    const s = {
      ...supData,
      id: `sup_${crypto.randomUUID()}`,
      pendingBalance: Number(supData.pendingBalance) || 0,
    };
    setSuppliers((prev) => [s, ...prev]);
  };

  const receiveGRNShipment = (poId, supplierId, items) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const grnItem = items.find((item) => item.productName === p.name);
        if (grnItem) {
          return {
            ...p,
            stock: (p.stock || 0) + Number(grnItem.qty),
            costPrice: Number(grnItem.costPrice) || p.costPrice,
          };
        }
        return p;
      })
    );

    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "Received (GRN Completed)" } : po))
    );
  };

  // Product & Customer Operations using crypto.randomUUID()
  const addProduct = (newProduct) => {
    const p = {
      ...newProduct,
      id: `p_${crypto.randomUUID()}`,
      stock: newProduct.stock === null ? null : Number(newProduct.stock) || 0,
      retailPrice: Number(newProduct.retailPrice) || 0,
      gst: Number(newProduct.gst) || 0,
    };
    setProducts((prev) => [p, ...prev]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCustomer = (customerData) => {
    const c = {
      ...customerData,
      id: `c_${crypto.randomUUID()}`,
      balance: Number(customerData.balance) || 0,
      loyaltyPoints: 0,
      history: customerData.balance > 0 ? [
        {
          id: `h_${crypto.randomUUID()}`,
          date: new Date().toISOString().split("T")[0],
          type: "debit",
          amount: Number(customerData.balance),
          note: "Opening Balance",
        }
      ] : [],
    };
    setCustomers((prev) => [c, ...prev]);
  };

  const recordCustomerPayment = (customerId, paidAmount, paymentNote = "Udhaar Payment") => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const amount = Number(paidAmount);
          const newHistory = [
            {
              id: `h_${crypto.randomUUID()}`,
              date: new Date().toISOString().split("T")[0],
              type: "credit",
              amount: amount,
              note: paymentNote,
            },
            ...(c.history || []),
          ];
          return {
            ...c,
            balance: Math.max(0, c.balance - amount),
            history: newHistory,
          };
        }
        return c;
      })
    );
  };

  const resetDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSales(initialSalesHistory);
    setStoreConfig(initialStoreConfig);
    setSuppliers(initialSuppliers);
    setPurchaseOrders(initialPurchaseOrders);
    clearCart();
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        storeConfig,
        setStoreConfig,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        recordCustomerPayment,
        suppliers,
        addSupplier,
        purchaseOrders,
        receiveGRNShipment,
        coupons,
        activeCoupon,
        applyCouponCode,
        redeemedPoints,
        setRedeemedPoints,
        sales,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCustomer,
        setCartCustomer,
        discountPercent,
        setDiscountPercent,
        discountRupees,
        setDiscountRupees,
        cartSubtotal,
        cartTaxDetails,
        cartGrandTotal,
        calculatedDiscount,
        stockWarningToast,
        completeCheckout,
        activeTab,
        setActiveTab,
        activeVertical,
        setActiveVertical,
        printableBill,
        setPrintableBill,
        printFormat,
        setPrintFormat,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
