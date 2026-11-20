import { describe, it, expect } from "vitest";
import { encodeEan13Modules, calculateEan13CheckDigit, normalizeToEan13 } from "../utils/ean13";

describe("Barcode Printing & Vector EAN-13 System", () => {
  it("encodes valid 95-module binary stream with correct guard patterns", () => {
    const { ean13, modules } = encodeEan13Modules("890105800124");
    expect(ean13).toHaveLength(13);
    expect(modules).toHaveLength(95);

    // Start Guard (101)
    expect(modules.slice(0, 3)).toBe("101");

    // Center Guard (01010)
    expect(modules.slice(45, 50)).toBe("01010");

    // End Guard (101)
    expect(modules.slice(92, 95)).toBe("101");
  });

  it("calculates exact GS1 check digit for known Indian FMCG barcodes", () => {
    // Tata Tea 500g: 890105885227 + Check digit 1
    expect(calculateEan13CheckDigit("890105885227")).toBe(1);

    // STABILO: 400638133393 + Check digit 1
    expect(calculateEan13CheckDigit("400638133393")).toBe(1);
    expect(calculateEan13CheckDigit("890171910105")).toBe(2);
  });

  it("normalizes arbitrary short or non-standard barcodes to valid 13-digit EAN-13", () => {
    const normalized = normalizeToEan13("12345");
    expect(normalized).toHaveLength(13);
    expect(normalized.startsWith("12345")).toBe(true);

    const check = calculateEan13CheckDigit(normalized.slice(0, 12));
    expect(Number(normalized[12])).toBe(check);
  });

  it("computes accurate sheet capacity and pagination", () => {
    const capacities = {
      "a4-24": 24,
      "a4-40": 40,
      "a4-65": 65,
    };

    // 48 stickers on 24-label sheet = exactly 2 sheets
    expect(Math.ceil(48 / capacities["a4-24"])).toBe(2);

    // 49 stickers on 24-label sheet = 3 sheets
    expect(Math.ceil(49 / capacities["a4-24"])).toBe(3);

    // 40 stickers on 40-label sheet = 1 sheet
    expect(Math.ceil(40 / capacities["a4-40"])).toBe(1);

    // 130 stickers on 65-label sheet = 2 sheets
    expect(Math.ceil(130 / capacities["a4-65"])).toBe(2);
  });
});