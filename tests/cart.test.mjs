import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CART_KEY, normalizeCart, readCart, writeCart } from '../src/lib/cart.ts';

const item = { slug: 'test-laptop', name: 'Test laptop', quantity: 2, price: { amount: 25000, currency: 'KES' } };

test('invalid stored shapes and entries cannot poison quantities or totals', () => {
  for (const value of [null, {}, 'text', 1]) assert.deepEqual(normalizeCart(value), []);
  const invalid = [null, {}, ...[0, -1, 1.5, '2', Infinity].map((quantity) => ({ ...item, quantity })),
    ...[-1, '25000', Infinity, NaN].map((amount) => ({ ...item, price: { amount } }))];
  assert.deepEqual(normalizeCart([...invalid, item]), [normalizeCart([item])[0]]);
  assert.equal(normalizeCart([item, item])[0].quantity, 4);
  assert.deepEqual(normalizeCart([{ ...item, slug: '../cart' }]), []);
});

test('malformed JSON and unavailable storage do not throw', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => '{' } });
    assert.deepEqual(readCart(), []);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
    assert.deepEqual(readCart(), []);
    assert.equal(writeCart([item]), false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test('saving preserves valid cart data and updates the badge; failed writes report failure', () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  let saved;
  const badge = { textContent: '', toggleAttribute(_name, hidden) { this.hidden = hidden; } };
  try {
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelectorAll: () => [badge] } });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: () => saved,
      setItem(key, value) { assert.equal(key, CART_KEY); saved = value; }
    } });
    assert.equal(writeCart([item]), true);
    assert.equal(readCart()[0].quantity, 2);
    assert.equal(badge.textContent, '2');
    assert.equal(writeCart([]), true);
    assert.equal(badge.hidden, true);
    globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    assert.equal(writeCart([item]), false);
    assert.deepEqual(readCart(), []);
  } finally {
    for (const [key, original] of [['localStorage', originalStorage], ['document', originalDocument]]) {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    }
  }
});
