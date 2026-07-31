import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialProducts,
  initialCustomers,
  initialSalesHistory,
  initialStoreConfig,
} from "../data/sampleData";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Store Config & Vertical Settings
  const [storeConfig, setStoreConfig] = useState(() => {
    const saved = localStorage.getItem("dukaan_store_config");
    return saved ? JSON.parse(saved) : initialStoreConfig;
  });

  // Products
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("dukaan_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Customers (Khata / Udhar Book)
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("dukaan_customers");
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  // Sales History
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("dukaan_sales");
    return saved ? JSON.parse(saved) : initialSalesHistory;
  });

  // Active Vertical Filter
  const [activeVertical, setActiveVertical] = useState("all");

  // POS Cart
  const [cart, setCart] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountRupees, setDiscountRupees] = useState(0);

  // App Navigation & UI States
  const [activeTab, setActiveTab] = useState("pos"); // 'pos', 'inventory', 'khata', 'reports', 'modules', 'settings'
  const [printableBill, setPrintableBill] = useState(null);
  const [printFormat, setPrintFormat] = useState("thermal"); // 'thermal' or 'a4' or 'kot'

  // KOT Kitchen Orders (for Restaurant Module)
  const [kotOrders, setKotOrders] = useState([]);

  // Appointments (for Salon Module)
  const [appointments, setAppointments] = useState([
    {
      id: "apt_1",
      customerName: "Dr. Ananya Roy",
      phone: "+91 99887 76655",
      serviceName: "Hair Cut & Styling Combo",
      staffName: "Priya (Senior Stylist)",
      date: "2026-07-31",
      time: "14:30",
      status: "Confirmed",
    },
  ]);

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
    localStorage.setItem("dukaan_sales", JSON.stringify(sales));
  }, [sales]);

  // Cart Operations with Multi-vertical Attribute support
  const addToCart = (product, qty = 1, customAttributes = {}) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].qty + qty;
        if (newQty <= 0) {
          return prevCart.filter((item) => item.id !== product.id);
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          total: newQty * updated[existingIndex].price,
        };
        return updated;
      } else {
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
  };

  // Cart Totals Calculation
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

  let calculatedDiscount = 0;
  if (discountRupees > 0) {
    calculatedDiscount = discountRupees;
  } else if (discountPercent > 0) {
    calculatedDiscount = (cartSubtotal * discountPercent) / 100;
  }

  const cartGrandTotal = Math.max(0, Math.round(cartSubtotal - calculatedDiscount));

  // Complete Sale / Checkout
  const completeCheckout = (paymentDetails) => {
    const invNumber = `INV-${1000 + sales.length + 1}`;
    const now = new Date().toISOString();
    const due = Math.max(0, cartGrandTotal - (paymentDetails.paidAmount || 0));

    const newInvoice = {
      id: invNumber,
      date: now,
      customerName: cartCustomer ? cartCustomer.name : "Cash Customer",
      customerPhone: cartCustomer ? cartCustomer.phone : "",
      customerId: cartCustomer ? cartCustomer.id : null,
      items: [...cart],
      subtotal: Math.round(cartTaxDetails.taxableAmount * 100) / 100,
      taxAmount: Math.round(cartTaxDetails.totalTax * 100) / 100,
      discount: calculatedDiscount,
      grandTotal: cartGrandTotal,
      paymentMode: paymentDetails.mode,
      paidAmount: paymentDetails.paidAmount,
      dueAmount: due,
      operator: storeConfig.ownerName || "Cashier",
    };

    // 1. Deduct Stock Inventory (bypassed if service item or null stock)
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);
        if (cartItem && p.stock !== null && p.stock !== undefined) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        }
        return p;
      })
    );

    // 2. Update Customer Ledger if Udhar
    if (cartCustomer && (paymentDetails.mode === "udhar" || due > 0)) {
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => {
          if (c.id === cartCustomer.id) {
            const addedDue = paymentDetails.mode === "udhar" ? cartGrandTotal : due;
            const newHistoryItem = {
              id: `h_${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              type: "debit",
              amount: addedDue,
              note: `Bill #${invNumber}`,
            };
            return {
              ...c,
              balance: c.balance + addedDue,
              history: [newHistoryItem, ...(c.history || [])],
            };
          }
          return c;
        })
      );
    }

    // 3. Add to KOT if kitchen item exists (Restaurant Module)
    const kotItems = cart.filter((item) => item.attributes?.is_kot_item);
    if (kotItems.length > 0) {
      const newKot = {
        id: `KOT-${Date.now()}`,
        billId: invNumber,
        tableNo: paymentDetails.tableNo || "Table 4",
        items: kotItems,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Pending Kitchen",
      };
      setKotOrders((prev) => [newKot, ...prev]);
    }

    // 4. Record Sales Log
    setSales((prev) => [newInvoice, ...prev]);

    // 5. Printable Invoice
    setPrintableBill(newInvoice);

    // 6. Clear Cart
    clearCart();

    return newInvoice;
  };

  // Product CRUD
  const addProduct = (newProduct) => {
    const p = {
      ...newProduct,
      id: `p_${Date.now()}`,
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

  // Customer Management
  const addCustomer = (customerData) => {
    const c = {
      ...customerData,
      id: `c_${Date.now()}`,
      balance: Number(customerData.balance) || 0,
      history: customerData.balance > 0 ? [
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "debit",
          amount: Number(customerData.balance),
          note: "Opening Balance",
        }
      ] : [],
    };
    setCustomers((prev) => [c, ...prev]);
  };

  const recordCustomerPayment = (customerId, paidAmount, paymentNote = "Udhar Payment") => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const amount = Number(paidAmount);
          const newHistory = [
            {
              id: `h_${Date.now()}`,
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

  // Salon Appointment creation
  const addAppointment = (appointment) => {
    setAppointments((prev) => [
      { id: `apt_${Date.now()}`, ...appointment, status: "Confirmed" },
      ...prev,
    ]);
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSales(initialSalesHistory);
    setStoreConfig(initialStoreConfig);
    clearCart();
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        storeConfig,
        setStoreConfig,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        recordCustomerPayment,
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
        completeCheckout,
        activeTab,
        setActiveTab,
        activeVertical,
        setActiveVertical,
        printableBill,
        setPrintableBill,
        printFormat,
        setPrintFormat,
        kotOrders,
        appointments,
        addAppointment,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
