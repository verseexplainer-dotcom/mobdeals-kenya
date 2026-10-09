export const CART_KEY = 'mobdeals_cart_v1';

export interface CartItem {
  slug: string;
  name: string;
  quantity: number;
  price: { amount: number; currency: string };
  image?: string;
  brand?: string;
  category?: string;
}

// Saved browser data can be malformed or come from an older version of the site.
export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const items = new Map<string, CartItem>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue;
    const { slug, name, quantity, price, image, brand, category } = candidate;
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      || typeof name !== 'string' || !name.trim()
      || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity <= 0
      || !price || typeof price.amount !== 'number' || !Number.isFinite(price.amount)
      || price.amount < 0 || !Number.isFinite(price.amount * quantity)) continue;
    const existing = items.get(slug);
    if (existing) {
      const combined = existing.quantity + quantity;
      if (Number.isSafeInteger(combined) && Number.isFinite(existing.price.amount * combined)) existing.quantity = combined;
      continue;
    }
    items.set(slug, {
      slug, name, quantity, price: { amount: price.amount, currency: 'KES' },
      image: typeof image === 'string' && /^(https?:\/\/|\/(?!\/))/.test(image) ? image : undefined,
      brand: typeof brand === 'string' ? brand : undefined,
      category: typeof category === 'string' ? category : undefined
    });
  }
  return [...items.values()];
}

export function readCart(): CartItem[] {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]'));
  } catch {
    return [];
  }
}

export function updateCartCount(items: CartItem[]): void {
  const count = items.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((target) => {
    target.textContent = String(count);
    target.toggleAttribute('hidden', count === 0);
  });
}

export function writeCart(items: CartItem[]): boolean {
  try {
    const normalized = normalizeCart(items);
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    updateCartCount(normalized);
    return true;
  } catch {
    return false;
  }
}
