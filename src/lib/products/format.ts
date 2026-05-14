import type { ProductPrice } from './types';

const currencyLocales: Record<ProductPrice['currency'], string> = {
  KES: 'en-KE',
  USD: 'en-US'
};

export function formatProductPrice(price: ProductPrice): string {
  return new Intl.NumberFormat(currencyLocales[price.currency], {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0
  }).format(price.amount);
}
