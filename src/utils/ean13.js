/**
 * DukaanPOS — Production EAN-13 Barcode Generator & Verifier
 * Pure algorithmic implementation according to GS1 General Specifications.
 */

// L-code patterns (odd parity) for left digits
const L_PATTERNS = [
  "0001101", // 0
  "0011001", // 1
  "0010011", // 2
  "0111101", // 3
  "0100011", // 4
  "0110001", // 5
  "0101111", // 6
  "0111011", // 7
  "0110111", // 8
  "0001011", // 9
];

// G-code patterns (even parity) for left digits
const G_PATTERNS = [
  "0100111", // 0
  "0110011", // 1
  "0011011", // 2
  "0100001", // 3
  "0011101", // 4
  "0111001", // 5
  "0000101", // 6
  "0010001", // 7
  "0001001", // 8
  "0010111", // 9
];

// R-code patterns for right digits (all complement of L)
const R_PATTERNS = [
  "1110010", // 0
  "1100110", // 1
  "1101100", // 2
  "1000010", // 3
  "1011100", // 4
  "1001110", // 5
  "1010000", // 6
  "1000100", // 7
  "1001000", // 8
  "1110100", // 9
];

// Structure of variable parity for digits 2-7 based on first digit (0-9)
const FIRST_DIGIT_PARITY = [
  "LLLLLL", // 0
  "LLGLGG", // 1
  "LLGGLG", // 2
  "LLGGGL", // 3
  "LGLLGG", // 4
  "LGGLLG", // 5
  "LGGGLL", // 6
  "LGLGLG", // 7
  "LGLGGL", // 8
  "LGGLGL", // 9
];

/**
 * Computes standard GS1 EAN-13 check digit for a 12-digit string
 */
export const calculateEan13CheckDigit = (twelveDigits) => {
  const digits = String(twelveDigits).replace(/\D/g, "");
  if (digits.length < 12) {
    const padded = digits.padEnd(12, "0");
    return calculateEan13CheckDigit(padded);
  }
  const d = digits.slice(0, 12).split("").map(Number);
  
  // Odd positions (0, 2, 4, 6, 8, 10 in 0-indexed) have weight 1
  // Even positions (1, 3, 5, 7, 9, 11 in 0-indexed) have weight 3
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += i % 2 === 0 ? d[i] : d[i] * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
};

/**
 * Normalizes input to a valid 13-digit EAN-13 string with valid check digit
 */
export const normalizeToEan13 = (inputBarcode) => {
  const digits = String(inputBarcode || "").replace(/\D/g, "");
  if (digits.length === 13) {
    // Verify or re-calculate checksum
    const first12 = digits.slice(0, 12);
    const expectedCheck = calculateEan13CheckDigit(first12);
    return `${first12}${expectedCheck}`;
  }
  const first12 = digits.slice(0, 12).padEnd(12, "0");
  const check = calculateEan13CheckDigit(first12);
  return `${first12}${check}`;
};

/**
 * Encodes an EAN-13 barcode into an array of bar widths and spaces for rendering.
 * Returns binary modules string (e.g., '101...01010...101') of length 95.
 */
export const encodeEan13Modules = (barcode) => {
  const ean13 = normalizeToEan13(barcode);
  const digits = ean13.split("").map(Number);
  const firstDigit = digits[0];
  const leftDigits = digits.slice(1, 7);
  const rightDigits = digits.slice(7, 13);
  const parityPattern = FIRST_DIGIT_PARITY[firstDigit];

  let binary = "";

  // Start Guard (101)
  binary += "101";

  // Left 6 digits
  for (let i = 0; i < 6; i++) {
    const digit = leftDigits[i];
    const parity = parityPattern[i];
    binary += parity === "L" ? L_PATTERNS[digit] : G_PATTERNS[digit];
  }

  // Center Guard (01010)
  binary += "01010";

  // Right 6 digits (including checksum digit)
  for (let i = 0; i < 6; i++) {
    const digit = rightDigits[i];
    binary += R_PATTERNS[digit];
  }

  // End Guard (101)
  binary += "101";

  return {
    ean13,
    modules: binary, // 95 bits
  };
};

/**
 * Converts 95 binary modules into run-length encoded bars [width, isBar] for clean SVG/CSS rendering
 */
export const getEan13Bars = (barcode) => {
  const { ean13, modules } = encodeEan13Modules(barcode);
  const runs = [];
  let currentBit = modules[0];
  let count = 0;

  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === currentBit) {
      count++;
    } else {
      runs.push({ width: count, isBar: currentBit === "1" });
      currentBit = modules[i];
      count = 1;
    }
  }
  runs.push({ width: count, isBar: currentBit === "1" });

  return { ean13, runs };
};
