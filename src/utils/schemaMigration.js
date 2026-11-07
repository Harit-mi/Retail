/**
 * DukaanPOS — Schema Versioning & Migration Engine
 * Safely migrates local storage databases and backup archives across versions.
 */

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Validates and migrates a complete store bundle to CURRENT_SCHEMA_VERSION
 */
export const migrateStoreBundle = (bundle) => {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Cannot migrate invalid or empty store bundle.");
  }

  const rawVersion = bundle._schemaVersion || bundle.schemaVersion || 1;
  const currentVersion = Number(rawVersion) || 1;

  let migrated = { ...bundle };

  if (currentVersion < 2) {
    // Migration: V1 -> V2
    // 1. Ensure Store Config has required single-store & outbox fields
    migrated.storeConfig = {
      name: "Gupta Kirana Store",
      tagline: "Your Daily Grocery & Essentials",
      phone: "+91 98765 43210",
      address: "Main Market, Sector 4, New Delhi",
      gstin: "07AAAAA0000A1Z5",
      fssai: "10020011000123",
      upiId: "guptakirana@upi",
      ownerName: "Ramesh Gupta",
      cashierPinHash: "",
      shiftOpeningFloat: 2000,
      cloudSyncEndpoint: "",
      cloudApiKey: "",
      ...(migrated.storeConfig || {}),
    };

    // 2. Normalize Products (ensure numeric fields, units, and barcode)
    migrated.products = (Array.isArray(migrated.products) ? migrated.products : []).map(
      (p, idx) => ({
        id: p.id || `p_${idx + 1}`,
        name: p.name || "Untitled Item",
        retailPrice: Number(p.retailPrice) || 0,
        costPrice: Number(p.costPrice) || 0,
        stock: p.stock === null ? null : Number(p.stock) || 0,
        gst: Number(p.gst) || 0,
        unit: p.unit || "pack",
        category: p.category || "General",
        barcode: p.barcode || "",
        minStockWarning: Number(p.minStockWarning) || 5,
        selling_unit_type: p.selling_unit_type || "piece",
        vertical: p.vertical || "kirana",
        ...p,
      })
    );

    // 3. Normalize Customers (ensure loyalty points, ledger history, numeric balance)
    migrated.customers = (Array.isArray(migrated.customers) ? migrated.customers : []).map(
      (c, idx) => ({
        id: c.id || `c_${idx + 1}`,
        name: c.name || "Customer",
        phone: c.phone || "",
        balance: Number(c.balance) || 0,
        loyaltyPoints: Number(c.loyaltyPoints) || 0,
        history: Array.isArray(c.history) ? c.history : [],
        ...c,
      })
    );

    // 4. Normalize Sales History (ensure UUIDs, numeric totals, item structure)
    migrated.sales = (Array.isArray(migrated.sales) ? migrated.sales : []).map(
      (s, idx) => ({
        id: s.id || `INV-${Date.now()}-${idx}`,
        date: s.date || new Date().toISOString(),
        customerName: s.customerName || "Walk-in Customer",
        customerPhone: s.customerPhone || "",
        customerId: s.customerId || null,
        items: Array.isArray(s.items) ? s.items : [],
        subtotal: Number(s.subtotal) || Number(s.grandTotal) || 0,
        taxAmount: Number(s.taxAmount) || 0,
        discount: Number(s.discount) || 0,
        grandTotal: Number(s.grandTotal) || 0,
        paymentMode: s.paymentMode || "cash",
        paidAmount: Number(s.paidAmount) || Number(s.grandTotal) || 0,
        dueAmount: Number(s.dueAmount) || 0,
        pointsEarned: Number(s.pointsEarned) || 0,
        operator: s.operator || "Cashier",
        ...s,
      })
    );

    // 5. Ensure suppliers & purchaseOrders arrays exist
    migrated.suppliers = Array.isArray(migrated.suppliers) ? migrated.suppliers : [];
    migrated.purchaseOrders = Array.isArray(migrated.purchaseOrders)
      ? migrated.purchaseOrders
      : [];

    migrated._schemaVersion = 2;
    if (migrated.storeConfig) {
      migrated.storeConfig._schemaVersion = 2;
    }
  }

  return migrated;
};

let memoryStorage = {};
const getStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof localStorage !== "undefined") return localStorage;
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null),
    setItem: (key, val) => {
      memoryStorage[key] = String(val);
    },
    removeItem: (key) => {
      delete memoryStorage[key];
    },
    clear: () => {
      memoryStorage = {};
    },
  };
};

/**
 * Creates an emergency pre-restore / pre-migration rollback checkpoint in localStorage
 */
export const saveRollbackCheckpoint = (label = "checkpoint") => {
  const storage = getStorage();

  try {
    const checkpoint = {
      timestamp: new Date().toISOString(),
      label,
      storeConfig: storage.getItem("dukaan_store_config"),
      products: storage.getItem("dukaan_products"),
      customers: storage.getItem("dukaan_customers"),
      suppliers: storage.getItem("dukaan_suppliers"),
      purchaseOrders: storage.getItem("dukaan_purchase_orders"),
      sales: storage.getItem("dukaan_sales"),
      currentShift: storage.getItem("dukaan_current_shift"),
      syncOutbox: storage.getItem("dukaan_sync_outbox"),
      pinVerifier: storage.getItem("dukaan_pin_verifier"),
    };

    const serialized = JSON.stringify(checkpoint);
    storage.setItem("dukaan_recovery_checkpoint", serialized);

    // Verify written checkpoint was persisted properly
    const verified = storage.getItem("dukaan_recovery_checkpoint");
    if (!verified || verified.length === 0) {
      throw new Error("Checkpoint persistence verification failed.");
    }

    return checkpoint;
  } catch (err) {
    console.warn("Failed to create recovery checkpoint in localStorage:", err);
    return null;
  }
};

/**
 * Restores store database from the rollback checkpoint
 */
export const restoreFromRollbackCheckpoint = () => {
  const storage = getStorage();

  try {
    const raw = storage.getItem("dukaan_recovery_checkpoint");
    if (!raw) {
      return { success: false, message: "No recovery checkpoint found." };
    }

    const checkpoint = JSON.parse(raw);
    if (!checkpoint || typeof checkpoint !== "object") {
      return { success: false, message: "Recovery checkpoint is corrupt or malformed." };
    }

    const keys = [
      "storeConfig",
      "products",
      "customers",
      "suppliers",
      "purchaseOrders",
      "sales",
      "currentShift",
      "syncOutbox",
      "pinVerifier",
    ];

    for (const key of keys) {
      const storageKey =
        key === "storeConfig"
          ? "dukaan_store_config"
          : key === "currentShift"
          ? "dukaan_current_shift"
          : key === "syncOutbox"
          ? "dukaan_sync_outbox"
          : `dukaan_${key.replace(/([A-Z])/g, "_$1").toLowerCase()}`;

      if (checkpoint[key] !== null && checkpoint[key] !== undefined) {
        storage.setItem(storageKey, checkpoint[key]);
      } else {
        // Clean up partial keys that were not present when checkpoint was taken
        storage.removeItem(storageKey);
      }
    }

    return {
      success: true,
      timestamp: checkpoint.timestamp,
      label: checkpoint.label,
    };
  } catch (err) {
    return { success: false, message: `Rollback failed: ${err.message}` };
  }
};
