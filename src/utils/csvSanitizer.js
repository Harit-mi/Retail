/**
 * Sanitize string cells to defend against CSV Formula Injection (=, +, -, @, tab, CR)
 * @param {string} str - Raw cell content string
 * @returns {string} Sanitized string safe for CSV export
 */
export const sanitizeCsvCell = (str = "") => {
  const s = String(str).replace(/"/g, '""');
  const trimmed = s.trimStart();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${s}`;
  }
  return s;
};
