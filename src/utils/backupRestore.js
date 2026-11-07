/**
 * DukaanPOS — Encrypted Backup & Restore Utility
 * Secure offline JSON vault with integrity verification, automated schema migration,
 * and pre-restore rollback checkpoints.
 */

import { encryptPayloadAsync, decryptPayloadAsync } from "./storageCrypto";
import { CURRENT_SCHEMA_VERSION, migrateStoreBundle, saveRollbackCheckpoint } from "./schemaMigration";

export const BACKUP_MAGIC_HEADER = "DUKAAN_VAULT_v1::";

/**
 * Creates an encrypted backup payload from the current store database
 */
export const createEncryptedBackup = async (storeBundle, pin) => {
  if (!pin || pin.length < 4) {
    throw new Error("Cannot create backup: A valid cashier PIN (at least 4 digits) is required.");
  }

  const meta = {
    app: "DukaanPOS",
    version: "2.2.0",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    storeName: storeBundle.storeConfig?.name || "Store",
    stats: {
      productsCount: (storeBundle.products || []).length,
      customersCount: (storeBundle.customers || []).length,
      salesCount: (storeBundle.sales || []).length,
    },
  };

  const payload = {
    _schemaVersion: CURRENT_SCHEMA_VERSION,
    metadata: meta,
    storeConfig: storeBundle.storeConfig,
    products: storeBundle.products,
    customers: storeBundle.customers,
    suppliers: storeBundle.suppliers,
    purchaseOrders: storeBundle.purchaseOrders,
    sales: storeBundle.sales,
  };

  const encrypted = await encryptPayloadAsync(payload, pin);
  return `${BACKUP_MAGIC_HEADER}${encrypted}`;
};

/**
 * Decrypts, validates, and automatically migrates an imported backup bundle.
 * Creates an emergency pre-restore rollback checkpoint in localStorage.
 */
export const verifyAndDecryptBackup = async (backupRawText, pin, createCheckpoint = true) => {
  if (!backupRawText || typeof backupRawText !== "string") {
    return { success: false, message: "Invalid backup file: Empty content." };
  }

  if (!pin || pin.length < 4) {
    return { success: false, message: "Decryption requires a valid PIN (at least 4 digits)." };
  }

  let cipherContent = backupRawText.trim();
  if (cipherContent.startsWith(BACKUP_MAGIC_HEADER)) {
    cipherContent = cipherContent.slice(BACKUP_MAGIC_HEADER.length);
  }

  const decrypted = await decryptPayloadAsync(cipherContent, pin, null);
  if (!decrypted) {
    return {
      success: false,
      message: "Decryption failed! Incorrect cashier PIN or corrupted backup file.",
    };
  }

  // Schema Validation
  if (!decrypted.storeConfig || !Array.isArray(decrypted.products)) {
    return {
      success: false,
      message: "Backup format error: Required store database tables missing.",
    };
  }

  // Save rollback checkpoint of current local storage before applying restore
  if (createCheckpoint) {
    saveRollbackCheckpoint("pre_restore");
  }

  // Run schema migration if from an earlier version
  const migrated = migrateStoreBundle(decrypted);

  return {
    success: true,
    data: migrated,
    metadata: decrypted.metadata || {
      schemaVersion: migrated._schemaVersion,
      exportDate: new Date().toISOString(),
      stats: {
        productsCount: migrated.products.length,
        customersCount: migrated.customers.length,
        salesCount: migrated.sales.length,
      },
    },
  };
};

/**
 * Trigger browser file download of backup blob
 */
export const downloadBackupFile = (backupString, storeName = "DukaanPOS") => {
  const dateStr = new Date().toISOString().split("T")[0];
  const safeName = storeName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `${safeName}_backup_${dateStr}.dukaan`;

  const blob = new Blob([backupString], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
