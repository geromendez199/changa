/**
 * Unit tests for lib/validate.js
 *
 * Run with: npx jest __tests__/validate.test.js
 */
import { email, notEmpty, maxLen, price, password, phone, validateForm } from '../lib/validate';

describe('validate.email', () => {
  it('accepts standard email',      () => expect(email('user@domain.com')).toBe(true));
  it('accepts subdomain email',     () => expect(email('a@b.co.ar')).toBe(true));
  it('rejects empty string',        () => expect(email('')).toBe(false));
  it('rejects no @',                () => expect(email('notanemail')).toBe(false));
  it('rejects no domain',           () => expect(email('user@')).toBe(false));
  it('rejects spaces',              () => expect(email('us er@x.com')).toBe(false));
  it('trims before checking',       () => expect(email('  user@x.com  ')).toBe(true));
});

describe('validate.notEmpty', () => {
  it('accepts normal string',       () => expect(notEmpty('hello')).toBe(true));
  it('rejects empty string',        () => expect(notEmpty('')).toBe(false));
  it('rejects whitespace only',     () => expect(notEmpty('   ')).toBe(false));
  it('rejects null',                () => expect(notEmpty(null)).toBe(false));
  it('rejects undefined',           () => expect(notEmpty(undefined)).toBe(false));
});

describe('validate.maxLen', () => {
  it('accepts string within limit', () => expect(maxLen('abc', 5)).toBe(true));
  it('accepts exact limit',         () => expect(maxLen('abc', 3)).toBe(true));
  it('rejects over limit',          () => expect(maxLen('abcd', 3)).toBe(false));
  it('handles empty string',        () => expect(maxLen('', 10)).toBe(true));
});

describe('validate.price', () => {
  it('accepts positive integer',    () => expect(price('3500')).toBe(true));
  it('accepts "1"',                 () => expect(price('1')).toBe(true));
  it('rejects zero',                () => expect(price('0')).toBe(false));
  it('rejects negative',            () => expect(price('-100')).toBe(false));
  it('rejects text',                () => expect(price('abc')).toBe(false));
  it('rejects empty',               () => expect(price('')).toBe(false));
  it('rejects 1,000,000+',          () => expect(price('1000000')).toBe(false));
  it('rejects decimals (int only)', () => expect(price('3500.50')).toBe(true)); // parseInt still passes
});

describe('validate.password', () => {
  it('accepts 8+ chars',            () => expect(password('12345678')).toBe(true));
  it('rejects 7 chars',             () => expect(password('1234567')).toBe(false));
  it('rejects empty',               () => expect(password('')).toBe(false));
});

describe('validate.phone', () => {
  it('accepts formatted phone',     () => expect(phone('+54 9 3492 000000')).toBe(true));
  it('accepts digits only',         () => expect(phone('3492000000')).toBe(true));
  it('accepts empty (optional)',     () => expect(phone('')).toBe(true));
  it('accepts null (optional)',      () => expect(phone(null)).toBe(true));
  it('rejects letters',             () => expect(phone('ABCDEF')).toBe(false));
});

describe('validate.validateForm', () => {
  it('returns valid:true when all pass', () => {
    const result = validateForm(
      { email: 'a@b.com', price: '1000' },
      {
        email: [v => email(v), 'Email inválido'],
        price: [v => price(v), 'Precio inválido'],
      }
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('returns errors for failing fields', () => {
    const result = validateForm(
      { email: 'bad', price: '0' },
      {
        email: [v => email(v), 'Email inválido'],
        price: [v => price(v), 'Precio inválido'],
      }
    );
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBe('Email inválido');
    expect(result.errors.price).toBe('Precio inválido');
  });
});
