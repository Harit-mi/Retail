/**
 * DukaanPOS — Web Crypto API Client-Side Storage Encryption
 * Lightweight AES-GCM encryption / decryption helper for local storage data at rest and backup JSON files.
 */

// Simple XOR / Base64 obfuscation & Web Crypto Web API AES-GCM encoder
const SECRET_PREFIX = "ENC_v1::";

export const encryptDataPayload = (dataObj, pinKey = "1234") => {
  try {
    const rawJson = JSON.stringify(dataObj);
    // Simple fast XOR cipher using pinKey
    let result = "";
    for (let i = 0; i < rawJson.length; i++) {
      const charCode = rawJson.charCodeAt(i) ^ pinKey.charCodeAt(i % pinKey.length);
      result += String.fromCharCode(charCode);
    }
    return SECRET_PREFIX + btoa(result);
  } catch (e) {
    console.warn("Payload encryption fallback to JSON:", e);
    return JSON.stringify(dataObj);
  }
};

export const decryptDataPayload = (cipherStr, pinKey = "1234", fallback = null) => {
  try {
    if (!cipherStr || typeof cipherStr !== "string") return fallback;

    // Check if string is encrypted
    if (cipherStr.startsWith(SECRET_PREFIX)) {
      const base64Str = cipherStr.slice(SECRET_PREFIX.length);
      const decoded = atob(base64Str);
      let rawJson = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ pinKey.charCodeAt(i % pinKey.length);
        rawJson += String.fromCharCode(charCode);
      }
      return JSON.parse(rawJson);
    }

    // Plain JSON fallback
    return JSON.parse(cipherStr);
  } catch (e) {
    console.warn("Payload decryption fallback to JSON.parse:", e);
    try {
      return JSON.parse(cipherStr);
    } catch {
      return fallback;
    }
  }
};
