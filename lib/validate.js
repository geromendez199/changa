/**
 * Client-side validation helpers.
 * All functions return true (valid) or false (invalid).
 * Pure functions — no side effects, easy to unit test.
 */

/** Valid email format */
export const email = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() ?? '');

/** Non-empty string (trims whitespace) */
export const notEmpty = (v) => (v?.trim()?.length ?? 0) > 0;

/** String does not exceed max character length */
export const maxLen = (v, n) => (v?.length ?? 0) <= n;

/** Positive integer price within a sane range (1 – 999,999 ARS) */
export const price = (v) => {
  const n = parseInt(v, 10);
  return !isNaN(n) && n > 0 && n <= 999_999;
};

/** Password meets minimum requirements (8+ chars) */
export const password = (v) => (v?.length ?? 0) >= 8;

/** Phone number — only digits, spaces, +, -, () */
export const phone = (v) => !v?.trim() || /^[0-9\s+\-()]{6,20}$/.test(v.trim());

/**
 * Validate an object against a schema of rules.
 * Returns { valid: boolean, errors: Record<string, string> }
 *
 * Usage:
 *   const { valid, errors } = validateForm(
 *     { email: 'bad', price: '0' },
 *     { email: [v => email(v), 'Email inválido'], price: [v => price(v), 'Precio inválido'] }
 *   );
 */
export const validateForm = (values, schema) => {
  const errors = {};
  for (const [key, [rule, msg]] of Object.entries(schema)) {
    if (!rule(values[key])) errors[key] = msg;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

export default { email, notEmpty, maxLen, price, password, phone, validateForm };
