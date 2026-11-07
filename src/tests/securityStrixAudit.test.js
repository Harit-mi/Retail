import { describe, it, expect } from "vitest";
import {
  encryptPayloadAsync,
  decryptPayloadAsync,
  hashPinAsync,
  verifyPinHashAsync,
} from "../utils/storageCrypto";
import { sanitizeCsvCell } from "../utils/csvSanitizer";

describe("Strix AI Security & Pentest Audit Suite", () => {
  const testSecretPayload = { storeName: "Gupta Kirana", balance: 50000 };
  const correctPin = "9876";

  it("proves AES-GCM authenticated encryption fails closed on tampered ciphertext (tamper-proofing)", async () => {
    const encrypted = await encryptPayloadAsync(testSecretPayload, correctPin);

    // Tamper with ciphertext by altering last hex character of the GCM authentication tag
    const lastChar = encrypted.slice(-1);
    const replacementChar = lastChar === "a" ? "b" : "a";
    const tampered = encrypted.slice(0, -1) + replacementChar;

    const result = await decryptPayloadAsync(tampered, correctPin, null);
    expect(result).toBeNull();
  });

  it("proves AES-GCM decryption fails closed when incorrect cashier PIN is supplied", async () => {
    const encrypted = await encryptPayloadAsync(testSecretPayload, correctPin);
    const wrongPin = "1111";

    const result = await decryptPayloadAsync(encrypted, wrongPin, null);
    expect(result).toBeNull();
  });

  it("hashes cashier PIN with salted PBKDF2 without exposing plaintext", async () => {
    const { verifierString, saltHex, hashHex } = await hashPinAsync(correctPin);
    expect(verifierString.startsWith("PBKDF2_PIN_v1::")).toBe(true);
    expect(verifierString).not.toContain(correctPin);
    expect(saltHex.length).toBe(32); // 16 bytes = 32 hex chars
    expect(hashHex.length).toBe(64); // 32 bytes = 64 hex chars
  });

  it("verifies entered PIN correctly against PBKDF2 verifier and rejects wrong PIN", async () => {
    const { verifierString } = await hashPinAsync(correctPin);
    const valid = await verifyPinHashAsync(correctPin, verifierString);
    expect(valid).toBe(true);

    const invalid = await verifyPinHashAsync("0000", verifierString);
    expect(invalid).toBe(false);

    const tampered = await verifyPinHashAsync(correctPin, "PBKDF2_PIN_v1::bad::hash");
    expect(tampered).toBe(false);
  });

  it("rejects unencrypted legacy plaintext JSON when allowLegacyPlaintext is false", async () => {
    const rawPlaintextJson = JSON.stringify({ item: "Sugar", stock: 10 });
    const result = await decryptPayloadAsync(rawPlaintextJson, correctPin, null, false);
    expect(result).toBeNull();

    const allowed = await decryptPayloadAsync(rawPlaintextJson, correctPin, null, true);
    expect(allowed).toEqual({ item: "Sugar", stock: 10 });
  });

  it("sanitizes CSV formula injection triggers (=, +, -, @) including leading whitespace to defend against spreadsheet RCE", () => {
    expect(sanitizeCsvCell("=SUM(1+1)")).toBe("'=SUM(1+1)");
    expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
    expect(sanitizeCsvCell("  =cmd|' /C calc'!A0")).toBe("'  =cmd|' /C calc'!A0");
    expect(sanitizeCsvCell("   +cmd")).toBe("'   +cmd");
    expect(sanitizeCsvCell("\t@HYPERLINK")).toBe("'\t@HYPERLINK");
    expect(sanitizeCsvCell("Regular Kirana Item")).toBe("Regular Kirana Item");
  });

  it("fails closed when encrypting with empty or missing PIN", async () => {
    await expect(encryptPayloadAsync(testSecretPayload, "")).rejects.toThrow();
    await expect(encryptPayloadAsync(testSecretPayload, null)).rejects.toThrow();
  });
});
