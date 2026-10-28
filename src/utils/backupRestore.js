/**
 * DukaanPOS — Encrypted Backup & Restore Utility
 * Secure offline JSON vault with integrity verification.
 */

import { encryptPayloadAsync, decryptPayloadAsync } from "./storageCrypto";

export const BACKUP_MAGIC_HEADER = "DUKAAN_VAULT_v1::";

/**
 * Creates an encrypted backup payload from the current store database
 */
export const createEncryptedBackup = async (storeBundle, pin) => {
  const meta = {
    app: "DukaanPOS",
    version: "2.1.0",
    exportDate: new Date().toISOString(),
    storeName: storeBundle.storeConfig?.name || "Store",
    stats: {
      productsCount: (storeBundle.products || []).length,
      customersCount: (storeBundle.customers || []).length,
      salesCount: (storeBundle.sales || []).length,
    },
  };

  const payload = {
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
 * Decrypts and validates an imported backup bundle
 */
export const verifyAndDecryptBackup = async (backupRawText, pin) => {
  if (!backupRawText || typeof backupRawText !== "string") {
    return { success: false, message: "Invalid backup file: Empty content." };
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
  if (!decrypted.metadata || !decrypted.storeConfig || !Array.isArray(decrypted.products)) {
    return {
      success: false,
      message: "Backup format error: Required store database tables missing.",
    };
  }

  return {
    success: true,
    data: decrypted,
    metadata: decrypted.metadata,
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
