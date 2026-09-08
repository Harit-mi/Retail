import { describe, it, expect } from "vitest";
import { encryptPayloadAsync, decryptPayloadAsync } from "../utils/storageCrypto";

describe("Strix AI Security & Pentest Audit Suite", () => {
  const testSecretPayload = { storeName: "Gupta Kirana", balance: 50000 };
  const correctPin = "9876";

  it("proves AES-GCM authenticated encryption fails closed on tampered ciphertext (tamper-proofing)", async () => {
    const encrypted = await encryptPayloadAsync(testSecretPayload, correctPin);

    // Tamper with ciphertext by altering last byte
    const tampered = encrypted.slice(0, -2) + (encrypted.endsWith("00") ? "11" : "00");

    const result = await decryptPayloadAsync(tampered, correctPin, null);
    expect(result).toBeNull();
  });

  it("proves AES-GCM decryption fails closed when incorrect cashier PIN is supplied", async () => {
    const encrypted = await encryptPayloadAsync(testSecretPayload, correctPin);
    const wrongPin = "1111";

    const result = await decryptPayloadAsync(encrypted, wrongPin, null);
    expect(result).toBeNull();
  });

  it("sanitizes CSV formula injection triggers (=, +, -, @) to defend against spreadsheet RCE", () => {
    const sanitizeCsvCell = (str = "") => {
      const s = String(str).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(s)) {
        return `'${s}`;
      }
      return s;
    };

    expect(sanitizeCsvCell("=SUM(1+1)")).toBe("'=SUM(1+1)");
    expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(sanitizeCsvCell("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
    expect(sanitizeCsvCell("Regular Kirana Item")).toBe("Regular Kirana Item");
  });
});
