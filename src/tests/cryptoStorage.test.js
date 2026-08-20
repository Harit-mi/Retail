import { describe, it, expect } from "vitest";
import { encryptPayloadAsync, decryptPayloadAsync } from "../utils/storageCrypto";

describe("Web Crypto API AES-GCM 256-bit Encryption & Decryption", () => {
  const sampleCustomer = {
    id: "cust-1",
    name: "Ramesh Sharma",
    phone: "9876543210",
    balance: 4500,
  };

  it("encrypts customer payload into AES_GCM_v1 format with zero plaintext matches", async () => {
    const pin = "5678";
    const cipherStr = await encryptPayloadAsync(sampleCustomer, pin);

    expect(cipherStr.startsWith("AES_GCM_v1::")).toBe(true);
    expect(cipherStr).not.toContain("Ramesh Sharma");
    expect(cipherStr).not.toContain("9876543210");
    expect(cipherStr).not.toContain("4500");
  });

  it("decrypts AES-GCM cipher payload accurately with correct PIN", async () => {
    const pin = "5678";
    const cipherStr = await encryptPayloadAsync(sampleCustomer, pin);
    const decrypted = await decryptPayloadAsync(cipherStr, pin, null);

    expect(decrypted).toEqual(sampleCustomer);
    expect(decrypted.name).toBe("Ramesh Sharma");
    expect(decrypted.balance).toBe(4500);
  });

  it("fails decryption with wrong PIN due to AES-GCM AEAD authentication", async () => {
    const correctPin = "5678";
    const wrongPin = "0000";
    const cipherStr = await encryptPayloadAsync(sampleCustomer, correctPin);
    const decrypted = await decryptPayloadAsync(cipherStr, wrongPin, null);

    expect(decrypted).toBeNull();
  });
});
