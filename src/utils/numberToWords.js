/**
 * Indian Numbering System to Words Converter (Rupees & Paise)
 * Compliant with Indian CBIC GST Tax Invoice statutory formatting.
 */

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const convertLessThanThousand = (num) => {
  if (num === 0) return "";
  if (num < 20) return ones[num] + " ";
  if (num < 100) return tens[Math.floor(num / 10)] + " " + (num % 10 !== 0 ? ones[num % 10] + " " : "");
  return ones[Math.floor(num / 100)] + " Hundred " + convertLessThanThousand(num % 100);
};

export const numberToIndianWords = (amount = 0) => {
  const num = Number(amount);
  if (isNaN(num) || num === 0) return "Zero Rupees Only";

  const absoluteNum = Math.abs(num);
  const rupees = Math.floor(absoluteNum);
  const paise = Math.round((absoluteNum - rupees) * 100);

  let words = "";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + "Crore ";
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + "Lakh ";
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + "Thousand ";
  }
  if (remainder > 0) {
    words += convertLessThanThousand(remainder);
  }

  const trimmed = words.trim();
  if (trimmed.length === 0) {
    words = "Zero Rupees";
  } else {
    words = trimmed + " Rupees";
  }

  if (paise > 0) {
    words += " and " + convertLessThanThousand(paise).trim() + " Paise";
  }

  words += " Only";

  return (num < 0 ? "Minus " : "") + words;
};
