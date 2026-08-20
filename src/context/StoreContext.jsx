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
import {
  calculateCartTotals,
  deductStockOnSale,
  updateCustomerLedger,
} from "../utils/moneyMath";

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

  // Global POS Counter Register PIN Lock State
  const [isCounterLocked, setIsCounterLocked] = useState(false);
  const [counterPin, setCounterPin] = useState(() => {
    return localStorage.getItem("dukaan_counter_pin") || "1234";
  });

  const lockCounter = () => {
    setIsCounterLocked(true);
  };

  const unlockCounter = (enteredPin) => {
    if (enteredPin === counterPin) {
      setIsCounterLocked(false);
      return { success: true };
    }
    return { success: false, message: `Incorrect PIN! Enter your ${counterPin.length}-digit cashier PIN.` };
  };

  const updateCounterPin = (newPin) => {
    if (!newPin || newPin.length < 4) return { success: false, message: "PIN must be at least 4 digits." };
    setCounterPin(newPin);
    localStorage.setItem("dukaan_counter_pin", newPin);
    return { success: true, message: "Cashier PIN updated successfully!" };
  };

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

        if (product.stock !== null && newQty > product.stock) {
          setStockWarningToast(`Soft Warning: Selling ${newQty} ${product.unit} of "${product.name}" (Recorded Stock: ${product.stock})`);
          setTimeout(() => setStockWarningToast(null), 3500);
        }
        return updated;
      } else {
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

  // Delegate Cart Totals & Discount Stacking Math to Production moneyMath.js
  const cartTotals = calculateCartTotals(
    cart,
    discountRupees,
    discountPercent,
    activeCoupon,
    redeemedPoints
  );

  const cartSubtotal = cartTotals.subtotal;
  const calculatedDiscount = cartTotals.calculatedDiscount;
  const cartGrandTotal = cartTotals.grandTotal;
  const cartTaxDetails = {
    taxableAmount: cartTotals.taxableSubtotal,
    totalTax: cartTotals.taxAmount,
  };

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

  // Complete Sale / Checkout using Production Utility Functions
  const completeCheckout = (paymentDetails) => {
    const invNumber = `INV-${1000 + sales.length + 1}`;
    const now = new Date().toISOString();

    const paid = Number(paymentDetails.paidAmount) || 0;
    const due = Math.max(0, cartGrandTotal - paid);
    const pointsEarned = Math.floor(cartGrandTotal / 100);

    const newInvoice = {
      id: invNumber,
      date: now,
      customerName: cartCustomer ? cartCustomer.name : t("walkInCustomer"),
      customerPhone: cartCustomer ? cartCustomer.phone : "",
      customerId: cartCustomer ? cartCustomer.id : null,
      items: [...cart],
      subtotal: cartTotals.taxableSubtotal,
      taxAmount: cartTotals.taxAmount,
      discount: Math.round(calculatedDiscount * 100) / 100,
      grandTotal: cartGrandTotal,
      paymentMode: paymentDetails.mode,
      paidAmount: paid,
      dueAmount: due,
      pointsEarned: pointsEarned,
      operator: storeConfig.ownerName || "Cashier",
    };

    // 1. Deduct Stock Inventory (delegated to moneyMath.js)
    setProducts((prevProducts) => deductStockOnSale(prevProducts, cart));

    // 2. Update Customer Ledger & Loyalty Points (delegated to moneyMath.js)
    if (cartCustomer) {
      setCustomers((prevCustomers) =>
        updateCustomerLedger(
          prevCustomers,
          cartCustomer.id,
          due,
          pointsEarned,
          redeemedPoints,
          invNumber
        )
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

  // Supplier Operations
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

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cartCustomer && cartCustomer.id === id) {
      setCartCustomer(null);
    }
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
        deleteCustomer,
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
        isCounterLocked,
        counterPin,
        lockCounter,
        unlockCounter,
        updateCounterPin,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
