/**
 * DukaanPOS — Production Web Crypto API (AES-GCM 256-bit + PBKDF2 Key Derivation)
 * Authenticated encryption at rest that fails closed on missing credentials or crypto errors.
 */

export const CIPHER_HEADER = "AES_GCM_v1::";

// Cross-platform Web Crypto API resolver (Node.js Vitest & Browser)
export const getSubtleCrypto = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    return { crypto: window.crypto, subtle: window.crypto.subtle };
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    return { crypto: globalThis.crypto, subtle: globalThis.crypto.subtle };
  }
  return null;
};

// Helper: Convert ArrayBuffer to Hex string
const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Helper: Convert Hex string to Uint8Array
const hexToBuffer = (hexStr) => {
  const bytes = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
  }
  return bytes;
};

/**
 * Derive AES-GCM 256-bit Key from Cashier PIN using PBKDF2 (100,000 iterations)
 * Fails closed if PIN is missing or too short.
 */
export const deriveKeyFromPin = async (pinStr, saltUint8, subtle) => {
  if (!pinStr || typeof pinStr !== "string" || pinStr.trim().length < 4) {
    throw new Error("Key derivation failed closed: Valid cashier PIN (at least 4 digits) is required.");
  }

  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(pinStr.trim()),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltUint8,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Asynchronously Encrypt Data Payload using native Web Crypto API (AES-GCM 256-bit)
 * Format: AES_GCM_v1::<salt_hex>::<iv_hex>::<ciphertext_hex>
 * FAILS CLOSED: Never returns plaintext on error.
 */
export const encryptPayloadAsync = async (dataObj, pinKey) => {
  if (!pinKey || typeof pinKey !== "string" || pinKey.trim().length < 4) {
    throw new Error("Encryption failed closed: Cashier PIN is required.");
  }

  const provider = getSubtleCrypto();
  if (!provider) {
    throw new Error("Encryption failed closed: Web Crypto API (subtle.crypto) is unavailable.");
  }

  try {
    const { crypto, subtle } = provider;
    const jsonStr = JSON.stringify(dataObj);
    const enc = new TextEncoder();
    const dataBuffer = enc.encode(jsonStr);

    // Generate 16-byte cryptographically secure random salt & 12-byte random IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKeyFromPin(pinKey, salt, subtle);

    const ciphertextBuffer = await subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      dataBuffer
    );

    const saltHex = bufferToHex(salt);
    const ivHex = bufferToHex(iv);
    const cipherHex = bufferToHex(ciphertextBuffer);

    return `${CIPHER_HEADER}${saltHex}::${ivHex}::${cipherHex}`;
  } catch (err) {
    // Fail closed: Never return plaintext JSON fallback!
    throw new Error(`Encryption failed closed: ${err.message}`);
  }
};

/**
 * Asynchronously Decrypt Data Payload using native Web Crypto API (AES-GCM 256-bit)
 * FAILS CLOSED: Returns fallback on decryption failure, never returns corrupted data.
 */
export const decryptPayloadAsync = async (cipherStr, pinKey, fallback = null, allowLegacyPlaintext = false) => {
  if (!cipherStr || typeof cipherStr !== "string") return fallback;

  if (cipherStr.startsWith(CIPHER_HEADER)) {
    if (!pinKey || typeof pinKey !== "string" || pinKey.trim().length < 4) {
      return fallback;
    }

    const provider = getSubtleCrypto();
    if (!provider) return fallback;

    try {
      const { subtle } = provider;
      const parts = cipherStr.split("::");
      if (parts.length < 4) return fallback;

      const saltHex = parts[1];
      const ivHex = parts[2];
      const cipherHex = parts[3];

      const salt = hexToBuffer(saltHex);
      const iv = hexToBuffer(ivHex);
      const ciphertext = hexToBuffer(cipherHex);

      const key = await deriveKeyFromPin(pinKey, salt, subtle);

      const decryptedBuffer = await subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      const jsonStr = dec.decode(decryptedBuffer);
      return JSON.parse(jsonStr);
    } catch {
      // Fail closed on invalid PIN or tampered ciphertext
      return fallback;
    }
  }

  // Non-encrypted JSON fallback (ONLY permitted when explicitly requested during legacy migration)
  if (allowLegacyPlaintext) {
    try {
      return JSON.parse(cipherStr);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

/**
 * Generate a Salted PBKDF2 Verifier Hash for Cashier PIN
 * Format: PBKDF2_PIN_v1::<salt_hex>::<hash_hex>
 * Never stores the raw PIN in persistent storage.
 */
export const hashPinAsync = async (pinStr, saltUint8 = null) => {
  if (!pinStr || typeof pinStr !== "string" || pinStr.trim().length < 4) {
    throw new Error("Valid cashier PIN (at least 4 digits) is required for hashing.");
  }
  const provider = getSubtleCrypto();
  if (!provider) throw new Error("Web Crypto API is unavailable.");
  const { crypto, subtle } = provider;

  const salt = saltUint8 || crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(pinStr.trim()),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedBits);
  return {
    saltHex,
    hashHex,
    verifierString: `PBKDF2_PIN_v1::${saltHex}::${hashHex}`,
  };
};

/**
 * Verify an Entered Cashier PIN against a Salted PBKDF2 Verifier Hash
 */
export const verifyPinHashAsync = async (enteredPin, verifierString) => {
  if (!enteredPin || !verifierString || typeof verifierString !== "string") return false;
  if (!verifierString.startsWith("PBKDF2_PIN_v1::")) return false;

  const parts = verifierString.split("::");
  if (parts.length !== 3) return false;

  const saltHex = parts[1];
  const expectedHash = parts[2];
  const salt = hexToBuffer(saltHex);

  try {
    const computed = await hashPinAsync(enteredPin, salt);
    return computed.hashHex === expectedHash;
  } catch {
    return false;
  }
};

// Synchronous wrapper exports
export const encryptDataPayload = () => {
  throw new Error("Synchronous encryption is disabled. Use encryptPayloadAsync to ensure fail-closed AES-GCM security.");
};

export const decryptDataPayload = (cipherStr, _pinKey, fallback = null) => {
  try {
    if (!cipherStr || typeof cipherStr !== "string") return fallback;
    if (cipherStr.startsWith(CIPHER_HEADER)) {
      // Cannot decrypt AES-GCM synchronously; return fallback
      return fallback;
    }
    return JSON.parse(cipherStr);
  } catch {
    return fallback;
  }
};
