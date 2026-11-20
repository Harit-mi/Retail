import { describe, it, expect } from "vitest";
import { numberToIndianWords } from "../utils/numberToWords";

describe("Indian Number to Words Utility (numberToWords.js)", () => {
  it("converts zero correctly", () => {
    expect(numberToIndianWords(0)).toBe("Zero Rupees Only");
    expect(numberToIndianWords(null)).toBe("Zero Rupees Only");
    expect(numberToIndianWords(undefined)).toBe("Zero Rupees Only");
  });

  it("converts single digits and tens correctly", () => {
    expect(numberToIndianWords(5)).toBe("Five Rupees Only");
    expect(numberToIndianWords(15)).toBe("Fifteen Rupees Only");
    expect(numberToIndianWords(75)).toBe("Seventy Five Rupees Only");
  });

  it("converts hundreds and thousands correctly", () => {
    expect(numberToIndianWords(100)).toBe("One Hundred Rupees Only");
    expect(numberToIndianWords(450)).toBe("Four Hundred Fifty Rupees Only");
    expect(numberToIndianWords(1250)).toBe("One Thousand Two Hundred Fifty Rupees Only");
    expect(numberToIndianWords(25000)).toBe("Twenty Five Thousand Rupees Only");
  });

  it("converts lakhs and crores in the Indian numbering system", () => {
    expect(numberToIndianWords(100000)).toBe("One Lakh Rupees Only");
    expect(numberToIndianWords(1250000)).toBe("Twelve Lakh Fifty Thousand Rupees Only");
    expect(numberToIndianWords(10000000)).toBe("One Crore Rupees Only");
    expect(numberToIndianWords(25000000)).toBe("Two Crore Fifty Lakh Rupees Only");
  });

  it("handles paise correctly", () => {
    expect(numberToIndianWords(100.5)).toBe("One Hundred Rupees and Fifty Paise Only");
    expect(numberToIndianWords(1420.75)).toBe("One Thousand Four Hundred Twenty Rupees and Seventy Five Paise Only");
    expect(numberToIndianWords(0.25)).toBe("Zero Rupees and Twenty Five Paise Only");
  });
});