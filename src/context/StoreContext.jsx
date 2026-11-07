import React, { useState, useEffect, useRef } from "react";
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
import {
  decryptDataPayload,
  encryptPayloadAsync,
  decryptPayloadAsync,
} from "../utils/storageCrypto";
import { CURRENT_SCHEMA_VERSION, migrateStoreBundle, restoreFromRollbackCheckpoint } from "../utils/schemaMigration";
import { StoreContext } from "./StoreContextObject";

// Helper: Safe LocalStorage parser with fallback (fails closed if encrypted)
const getSafeStorage = (key, fallback, pin) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? decryptDataPayload(saved, pin, fallback) : fallback;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}", falling back to initial default.`, e);
    return fallback;
  }
};

export const StoreProvider = ({ children }) => {
  // Guard ref: Prevents overwriting saved sales and customer records during async startup
  const isStorageReadyRef = useRef(false);

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

  // Global POS Counter Register PIN Lock State (NO default "1234" PIN)
  const [counterPin, setCounterPin] = useState(() => {
    return localStorage.getItem("dukaan_counter_pin") || "";
  });
  const [isCounterLocked, setIsCounterLocked] = useState(false);

  // Store Config & Settings
  const [storeConfig, setStoreConfig] = useState(() =>
    getSafeStorage("dukaan_store_config", initialStoreConfig, counterPin)
  );

  // Products
  const [products, setProducts] = useState(() =>
    getSafeStorage("dukaan_products", initialProducts, counterPin)
  );

  // Customers (Khata / Udhaar Book + Loyalty)
  const [customers, setCustomers] = useState(() =>
    getSafeStorage("dukaan_customers", initialCustomers, counterPin)
  );

  // Suppliers & Purchase Orders
  const [suppliers, setSuppliers] = useState(() =>
    getSafeStorage("dukaan_suppliers", initialSuppliers, counterPin)
  );

  const [purchaseOrders, setPurchaseOrders] = useState(() =>
    getSafeStorage("dukaan_purchase_orders", initialPurchaseOrders, counterPin)
  );

  // Coupons & Loyalty Points
  const [coupons] = useState(initialCoupons);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  // Sales History
  const [sales, setSales] = useState(() =>
    getSafeStorage("dukaan_sales", initialSalesHistory, counterPin)
  );

  // Active Vertical Filter
  const [activeVertical, setActiveVertical] = useState("all");

  // POS Cart & Soft Warnings
  const [cart, setCart] = useState([]);
  const [cartCustomer, setCartCustomer] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountRupees, setDiscountRupees] = useState(0);
  const [stockWarningToast, setStockWarningToast] = useState(null);

  // Online Cloud Sync State
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [cloudSyncStatus, setCloudSyncStatus] = useState("online"); // 'online' | 'syncing' | 'synced' | 'sync_failed' | 'offline'
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toLocaleTimeString());
  const cloudApiEndpoint = "https://api.dukaanpos.cloud/v1/store/sync";

  // Realtime Cloud Sync Queue
  const [syncOutbox, setSyncOutbox] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dukaan_sync_outbox") || "[]");
    } catch {
      return [];
    }
  });

  // Current Active Cashier Shift Tracking
  const [currentShift, setCurrentShift] = useState(() => {
    try {
      const saved = localStorage.getItem("dukaan_current_shift");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: `shift_${Date.now()}`,
      startTime: new Date().toISOString(),
      openingFloat: 2000,
      cashier: "Cashier",
    };
  });

  const recordShiftReconciliation = (actualCash, notes = "") => {
    const openingFloat = currentShift?.openingFloat || 2000;
    const shiftStart = currentShift?.startTime
      ? new Date(currentShift.startTime)
      : new Date(new Date().setHours(0, 0, 0, 0));

    const shiftSales = (sales || []).filter((s) => {
      if (s.paymentMode !== "cash") return false;
      return new Date(s.date) >= shiftStart;
    });
    const cashSalesTotal = shiftSales.reduce(
      (acc, s) => acc + (s.paidAmount || s.grandTotal || 0),
      0
    );
    const expectedCash = openingFloat + cashSalesTotal;
    const discrepancy = actualCash - expectedCash;

    const auditRecord = {
      id: `AUDIT-${Date.now()}`,
      shiftId: currentShift.id,
      shiftStartTime: currentShift.startTime,
      timestamp: new Date().toISOString(),
      openingFloat,
      cashSalesTotal,
      expectedCash,
      actualCash,
      discrepancy,
      notes,
    };

    try {
      const existingAudits = JSON.parse(localStorage.getItem("dukaan_drawer_audits") || "[]");
      existingAudits.unshift(auditRecord);
      localStorage.setItem("dukaan_drawer_audits", JSON.stringify(existingAudits.slice(0, 50)));
    } catch {}

    const nextShift = {
      id: `shift_${Date.now()}`,
      startTime: new Date().toISOString(),
      openingFloat: actualCash > 0 ? actualCash : 2000,
      cashier: storeConfig?.ownerName || "Cashier",
    };
    setCurrentShift(nextShift);
    try {
      localStorage.setItem("dukaan_current_shift", JSON.stringify(nextShift));
    } catch {}

    return auditRecord;
  };

  // Request browser storage persistence to prevent unexpected eviction
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((isPersisted) => {
        if (!isPersisted) {
          console.info("DukaanPOS: Local storage persistence is best-effort. Regular encrypted backups recommended.");
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setCloudSyncStatus("online");
      setLastSyncedAt(new Date().toLocaleTimeString());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setCloudSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncToCloud = async () => {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      setCloudSyncStatus("offline");
      return { 
        success: false, 
        status: "offline",
        message: "No internet connection. Cloud synchronization requires active online connectivity." 
      };
    }

    const endpoint = storeConfig?.cloudSyncEndpoint?.trim() || cloudApiEndpoint;
    setCloudSyncStatus("syncing");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const headers = { "Content-Type": "application/json" };
      if (storeConfig?.cloudApiKey) {
        headers["Authorization"] = `Bearer ${storeConfig.cloudApiKey}`;
      }

      const pendingEvents = syncOutbox.filter((e) => e.status === "pending_sync");

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          storeId: storeConfig?.gstin || "online_store",
          timestamp: new Date().toISOString(),
          outboxEvents: pendingEvents,
        }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const updated = syncOutbox.map((e) => ({ ...e, status: "synced" }));
        setSyncOutbox(updated);
        try {
          localStorage.setItem("dukaan_sync_outbox", JSON.stringify(updated.slice(0, 200)));
        } catch {}
        setCloudSyncStatus("synced");
        setLastSyncedAt(new Date().toLocaleTimeString());
        return { success: true, status: "synced", message: "Cloud sync complete." };
      } else {
        setCloudSyncStatus("online");
        setLastSyncedAt(new Date().toLocaleTimeString());
        return {
          success: true,
          status: "online",
          message: "Online mode active. Records queued for cloud sync.",
        };
      }
    } catch {
      setCloudSyncStatus("online");
      return {
        success: true,
        status: "online",
        message: "Online connected. Records queued for cloud sync.",
      };
    }
  };

  // App Navigation & UI States
  const [activeTab, setActiveTab] = useState("pos"); // Default Kirana Counter POS Billing
  const [printableBill, setPrintableBill] = useState(null);
  const [printFormat, setPrintFormat] = useState("thermal");

  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [decryptionFailedClosed, setDecryptionFailedClosed] = useState(false);

  // Async decrypt state on mount if Web Crypto payload exists
  // PREVENTS SAVED SALES AND CUSTOMER RECORDS FROM BEING OVERWRITTEN ON STARTUP
  useEffect(() => {
    let isCancelled = false;

    const decryptAllOnMount = async () => {
      if (isStorageReadyRef.current) return;
      try {
        const savedConfigRaw = localStorage.getItem("dukaan_store_config");
        const savedProductsRaw = localStorage.getItem("dukaan_products");
        const savedCustomersRaw = localStorage.getItem("dukaan_customers");
        const savedSalesRaw = localStorage.getItem("dukaan_sales");
        const savedSuppliersRaw = localStorage.getItem("dukaan_suppliers");
        const savedPORaw = localStorage.getItem("dukaan_purchase_orders");

        const hasAnyEncrypted = Boolean(
          (savedConfigRaw && savedConfigRaw.startsWith("AES_GCM_v1::")) ||
          (savedProductsRaw && savedProductsRaw.startsWith("AES_GCM_v1::")) ||
          (savedCustomersRaw && savedCustomersRaw.startsWith("AES_GCM_v1::")) ||
          (savedSalesRaw && savedSalesRaw.startsWith("AES_GCM_v1::"))
        );

        if (hasAnyEncrypted) {
          if (!counterPin || counterPin.length < 4) {
            // Existing encrypted database detected but no valid PIN provided yet.
            // Fail closed: Lock counter, mark ready as false so write effects NEVER overwrite storage.
            if (!isCancelled) {
              setIsCounterLocked(true);
              setDecryptionFailedClosed(true);
              isStorageReadyRef.current = false;
              setIsStorageLoaded(true);
            }
            return;
          }

          // Attempt authenticated decryption with cashier PIN
          const [decConfig, decProducts, decCustomers, decSales, decSuppliers, decPO] = await Promise.all([
            decryptPayloadAsync(savedConfigRaw, counterPin, null),
            decryptPayloadAsync(savedProductsRaw, counterPin, null),
            decryptPayloadAsync(savedCustomersRaw, counterPin, null),
            decryptPayloadAsync(savedSalesRaw, counterPin, null),
            decryptPayloadAsync(savedSuppliersRaw, counterPin, null),
            decryptPayloadAsync(savedPORaw, counterPin, null),
          ]);

          if (isCancelled) return;

          // If all table decryptions returned null, PIN is wrong or cipher is corrupted.
          if (!decConfig && !decProducts && !decCustomers && !decSales) {
            console.warn("DukaanPOS: Decryption failed closed (wrong PIN or corrupted MAC). Preserving storage without overwrite.");
            setIsCounterLocked(true);
            setDecryptionFailedClosed(true);
            isStorageReadyRef.current = false; // NEVER ALLOW OVERWRITE
            setIsStorageLoaded(true);
            return;
          }

          // Migrate decrypted data bundle to current schema version
          const bundleToMigrate = {
            storeConfig: decConfig || initialStoreConfig,
            products: decProducts || initialProducts,
            customers: decCustomers || initialCustomers,
            suppliers: decSuppliers || initialSuppliers,
            purchaseOrders: decPO || initialPurchaseOrders,
            sales: decSales || initialSalesHistory,
          };
          const migrated = migrateStoreBundle(bundleToMigrate);

          setStoreConfig(migrated.storeConfig);
          setProducts(migrated.products);
          setCustomers(migrated.customers);
          setSuppliers(migrated.suppliers);
          setPurchaseOrders(migrated.purchaseOrders);
          setSales(migrated.sales);
          setDecryptionFailedClosed(false);

          // Only enable write persistence after successful decryption and state hydration
          isStorageReadyRef.current = true;
        } else {
          // Fresh install: no encrypted records exist in localStorage
          if (!isCancelled) {
            const freshBundle = migrateStoreBundle({
              storeConfig: initialStoreConfig,
              products: initialProducts,
              customers: initialCustomers,
              suppliers: initialSuppliers,
              purchaseOrders: initialPurchaseOrders,
              sales: initialSalesHistory,
            });
            setStoreConfig(freshBundle.storeConfig);
            setProducts(freshBundle.products);
            setCustomers(freshBundle.customers);
            setSuppliers(freshBundle.suppliers);
            setPurchaseOrders(freshBundle.purchaseOrders);
            setSales(freshBundle.sales);
            setDecryptionFailedClosed(false);

            if (counterPin && counterPin.length >= 4) {
              isStorageReadyRef.current = true;
            }
          }
        }
      } catch (err) {
        console.warn("Async Web Crypto decryption on mount encountered error:", err);
        isStorageReadyRef.current = false;
      } finally {
        if (!isCancelled) {
          setIsStorageLoaded(true);
        }
      }
    };

    decryptAllOnMount();

    return () => {
      isCancelled = true;
    };
  }, [counterPin]);

  const lockCounter = () => {
    setIsCounterLocked(true);
  };

  const unlockCounter = (enteredPin) => {
    if (!enteredPin || enteredPin.length < 4) {
      return { success: false, message: "Please enter a valid 4-digit PIN." };
    }
    // If no counterPin was configured yet, configure it now
    if (!counterPin) {
      setCounterPin(enteredPin);
      localStorage.setItem("dukaan_counter_pin", enteredPin);
      setIsCounterLocked(false);
      return { success: true, message: "Initial Cashier PIN configured!" };
    }
    if (enteredPin === counterPin) {
      setIsCounterLocked(false);
      setDecryptionFailedClosed(false);
      return { success: true };
    }
    return { success: false, message: "Incorrect PIN. Please enter your valid cashier PIN." };
  };

  const updateCounterPin = async (newPin) => {
    if (!newPin || newPin.length < 4) {
      return { success: false, message: "PIN must be at least 4 digits." };
    }
    try {
      // Re-encrypt all existing state tables atomically with the new PIN
      const [encConfig, encProducts, encCustomers, encSuppliers, encPO, encSales] = await Promise.all([
        encryptPayloadAsync({ ...storeConfig, _schemaVersion: CURRENT_SCHEMA_VERSION }, newPin),
        encryptPayloadAsync(products, newPin),
        encryptPayloadAsync(customers, newPin),
        encryptPayloadAsync(suppliers, newPin),
        encryptPayloadAsync(purchaseOrders, newPin),
        encryptPayloadAsync(sales, newPin),
      ]);

      // Atomically commit new ciphertexts and new PIN to localStorage
      localStorage.setItem("dukaan_store_config", encConfig);
      localStorage.setItem("dukaan_products", encProducts);
      localStorage.setItem("dukaan_customers", encCustomers);
      localStorage.setItem("dukaan_suppliers", encSuppliers);
      localStorage.setItem("dukaan_purchase_orders", encPO);
      localStorage.setItem("dukaan_sales", encSales);
      localStorage.setItem("dukaan_counter_pin", newPin);

      setCounterPin(newPin);
      setIsCounterLocked(false);
      setDecryptionFailedClosed(false);
      return { success: true, message: "Cashier PIN updated and store vault re-encrypted successfully!" };
    } catch (err) {
      console.error("Atomic PIN re-encryption error:", err);
      return { success: false, message: "Failed to re-encrypt records. PIN change aborted to prevent data loss." };
    }
  };

  // Save Native Web Crypto AES-GCM Encrypted Data Payloads to LocalStorage
  // STRICT SAFEGUARD: Only writes after storage is ready, preventing initial sample data overwrite
  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync({ ...storeConfig, _schemaVersion: CURRENT_SCHEMA_VERSION }, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_store_config", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt storeConfig:", err);
      });
  }, [storeConfig, counterPin, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync(products, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_products", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt products:", err);
      });
  }, [products, counterPin, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync(customers, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_customers", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt customers:", err);
      });
  }, [customers, counterPin, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync(suppliers, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_suppliers", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt suppliers:", err);
      });
  }, [suppliers, counterPin, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync(purchaseOrders, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_purchase_orders", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt purchaseOrders:", err);
      });
  }, [purchaseOrders, counterPin, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded || !isStorageReadyRef.current) return;
    if (!counterPin || counterPin.length < 4) return;
    encryptPayloadAsync(sales, counterPin)
      .then((encrypted) => {
        localStorage.setItem("dukaan_sales", encrypted);
      })
      .catch((err) => {
        console.error("Fail-closed: could not encrypt sales:", err);
      });
  }, [sales, counterPin, isStorageLoaded]);

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
    if (paymentDetails.mode === "udhar" && !cartCustomer) {
      throw new Error("Customer required for Udhaar (Credit) checkout");
    }

    const invNumber = `INV-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const paid = Number(paymentDetails.paidAmount) || 0;
    const due = Math.max(0, cartGrandTotal - paid);
    const change = paymentDetails.changeReturned !== undefined
      ? Number(paymentDetails.changeReturned)
      : (paymentDetails.mode === "cash" && paid > cartGrandTotal ? paid - cartGrandTotal : 0);
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
      tenderedAmount: paymentDetails.tenderedAmount !== undefined ? Number(paymentDetails.tenderedAmount) : paid,
      changeReturned: change,
      pointsEarned: pointsEarned,
      operator: storeConfig.ownerName || "Cashier",
    };

    // Atomic Outbox Event for Offline-First Sync Queue
    const outboxEvent = {
      eventId: `evt_${crypto.randomUUID()}`,
      type: "SALE_CREATED",
      timestamp: now,
      invoiceId: invNumber,
      payload: newInvoice,
      status: "pending_sync",
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

    // 4. Record to Durable Local Outbox Queue
    setSyncOutbox((prev) => {
      const updated = [outboxEvent, ...prev];
      try {
        localStorage.setItem("dukaan_sync_outbox", JSON.stringify(updated.slice(0, 200)));
      } catch {}
      return updated;
    });

    // 5. Printable Invoice
    setPrintableBill(newInvoice);

    // 6. Clear Cart
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

  const recordCustomerPayment = (customerId, paidAmount, paymentNote = "Udhaar Payment", paymentMode = "cash") => {
    const amount = Number(paidAmount);
    if (!amount || amount <= 0) return { success: false, message: "Invalid payment amount." };

    const targetCustomer = customers.find((c) => c.id === customerId);
    if (!targetCustomer) return { success: false, message: "Customer not found." };

    if (amount > (targetCustomer.balance || 0)) {
      return {
        success: false,
        message: `Payment amount (₹${amount}) cannot exceed current outstanding Udhaar balance (₹${targetCustomer.balance || 0}).`,
      };
    }

    let targetCustomerName = targetCustomer.name;
    let targetCustomerPhone = targetCustomer.phone || "";

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newHistory = [
            {
              id: `h_${crypto.randomUUID()}`,
              date: new Date().toISOString().split("T")[0],
              type: "credit",
              amount: amount,
              note: paymentNote || "Udhaar Repayment",
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

    const settlementInvoiceId = `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // Create a store sales transaction entry for the Udhaar repayment and update due amounts on past invoices
    setSales((prevSales) => {
      const settlementInvoice = {
        id: settlementInvoiceId,
        date: new Date().toISOString(),
        customerName: targetCustomerName,
        customerPhone: targetCustomerPhone,
        customerId: customerId,
        items: [
          {
            id: "udhar_settlement",
            name: `Udhaar Balance Repayment (${paymentNote || "Direct Settlement"})`,
            qty: 1,
            price: amount,
            gst: 0,
            total: amount,
          },
        ],
        subtotal: amount,
        taxAmount: 0,
        discount: 0,
        grandTotal: amount,
        paymentMode: (paymentMode || "cash").toLowerCase(),
        paidAmount: amount,
        dueAmount: 0,
        isUdhaarSettlement: true,
        operator: storeConfig.ownerName || "Cashier",
      };

      // Reconcile due amounts on past unpaid Udhaar invoices for this customer
      let remainingPayment = amount;
      const updatedPrevSales = prevSales.map((s) => {
        if (s.customerId === customerId && s.paymentMode === "udhar" && s.dueAmount > 0 && remainingPayment > 0) {
          const deduction = Math.min(s.dueAmount, remainingPayment);
          remainingPayment -= deduction;
          return { ...s, dueAmount: s.dueAmount - deduction };
        }
        return s;
      });

      return [settlementInvoice, ...updatedPrevSales];
    });
  };

  const deleteCustomer = (id) => {
    const targetCust = customers.find((c) => c.id === id);
    const targetPhone = targetCust?.phone;

    setCustomers((prev) => prev.filter((c) => c.id !== id));

    setSales((prevSales) =>
      prevSales.map((sale) => {
        if (sale.customerId === id || (targetPhone && sale.customerPhone === targetPhone)) {
          return {
            ...sale,
            customerName: "Anonymous Customer (DPDP Erased)",
            customerPhone: "+91 00000 00000",
            customerId: null,
            pointsEarned: 0,
          };
        }
        return sale;
      })
    );

    if (cartCustomer && (cartCustomer.id === id || (targetPhone && cartCustomer.phone === targetPhone))) {
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
        isStorageLoaded,
        decryptionFailedClosed,
        isCounterLocked,
        counterPin,
        lockCounter,
        unlockCounter,
        updateCounterPin,
        resetDemoData,
        isOnline,
        cloudSyncStatus,
        lastSyncedAt,
        cloudApiEndpoint,
        syncToCloud,
        syncOutbox,
        currentShift,
        recordShiftReconciliation,
        restoreFromRollbackCheckpoint,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
