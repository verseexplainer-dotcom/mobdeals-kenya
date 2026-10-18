import { readCart, type CartItem } from '@lib/cart';
import { captureAttribution, formatLeadReference, getAttributionEventProperties } from './attribution';
import { syncConsentProviders, trackEvent } from './index';

const formatCartItems = (items: CartItem[]) => items.map((item) => ({
  item_id: item.slug,
  item_name: item.name,
  item_brand: item.brand ?? '',
  item_category: item.category ?? '',
  price: item.price.amount,
  quantity: item.quantity
}));

const cartTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);

function trackPageView(): void {
  const attribution = captureAttribution();
  trackEvent({
    name: 'page_view',
    properties: {
      page_location: `${location.origin}${location.pathname}`,
      page_title: document.title,
      page_referrer: attribution.referrer,
      ...getAttributionEventProperties()
    }
  });

  const product = document.querySelector<HTMLElement>('[data-analytics-product]');
  if (product) {
    const price = Number(product.dataset.itemPrice ?? 0);
    trackEvent({
      name: 'view_item',
      properties: {
        currency: 'KES',
        value: Number.isFinite(price) ? price : 0,
        items: [{
          item_id: product.dataset.itemId ?? '',
          item_name: product.dataset.itemName ?? '',
          item_brand: product.dataset.itemBrand ?? '',
          item_category: product.dataset.itemCategory ?? '',
          price: Number.isFinite(price) ? price : 0,
          quantity: 1
        }]
      }
    });
  }

  if (/^\/(shop|category|brands)(\/|$)/.test(location.pathname)) {
    const seen = new Set<string>();
    const items = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/products/"]'))
      .filter((link) => {
        const path = new URL(link.href).pathname;
        if (seen.has(path)) return false;
        seen.add(path);
        return true;
      })
      .slice(0, 50)
      .map((link) => ({ item_id: new URL(link.href).pathname.split('/').pop() ?? '' }));
    if (items.length > 0) {
      trackEvent({
        name: 'view_item_list',
        properties: { item_list_id: location.pathname.replaceAll('/', '_').replace(/^_|_$/g, '') || 'shop', item_count: seen.size, items }
      });
    }
  }

  if (document.querySelector('[data-cart-items]')) {
    const items = readCart();
    trackEvent({
      name: 'view_cart',
      properties: {
        currency: 'KES',
        value: cartTotal(items),
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        items: formatCartItems(items)
      }
    });
  }

  if (location.pathname === '/search') {
    const query = new URLSearchParams(location.search).get('q')?.trim();
    if (query) {
      const count = Number(document.querySelector('[data-search-count]')?.textContent?.match(/\d+/)?.[0] ?? 0);
      trackEvent({ name: 'search', properties: { search_term: query.slice(0, 100), result_count: count } });
    }
  }
}

function trackWhatsAppClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>('a[href*="wa.me/"]');
  if (!link) return;

  try {
    const href = new URL(link.href);
    const message = href.searchParams.get('text') ?? '';
    const ref = formatLeadReference();
    if (!message.includes('[Ref:')) href.searchParams.set('text', `${message.trim()}\n\n${ref}`.trim());
    link.href = href.toString();
  } catch {
    // Leave malformed or unsupported links untouched.
  }

  const attribution = getAttributionEventProperties();
  const product = document.querySelector<HTMLElement>('[data-analytics-product]');
  const itemProperties = product ? {
    item_id: product.dataset.itemId ?? '',
    item_name: product.dataset.itemName ?? '',
    item_brand: product.dataset.itemBrand ?? '',
    item_category: product.dataset.itemCategory ?? '',
    price: Number(product.dataset.itemPrice ?? 0)
  } : {};
  const cartCheckout = link.matches('[data-cart-whatsapp]');
  const isCart = cartCheckout || Boolean(document.querySelector('[data-cart-items]'));
  const cart = isCart ? readCart() : [];
  const properties = {
    ...attribution,
    page_location: `${location.origin}${location.pathname}`,
    interaction_type: cartCheckout ? 'cart_checkout' : product ? 'product_order' : 'support',
    ...itemProperties
  };

  trackEvent({ name: 'lead_whatsapp_click', properties });
  if (cartCheckout && cart.length > 0) {
    trackEvent({
      name: 'begin_checkout',
      properties: {
        currency: 'KES',
        value: cartTotal(cart),
        item_count: cart.reduce((sum, item) => sum + item.quantity, 0),
        items: formatCartItems(cart),
        ...attribution
      }
    });
  }
}

function trackSearchResults(event: Event): void {
  const detail = (event as CustomEvent<{ query?: string; resultCount?: number }>).detail;
  const query = String(detail?.query ?? '').trim().slice(0, 100);
  if (!query) return;
  trackEvent({
    name: 'search',
    properties: { search_term: query, result_count: Number(detail?.resultCount ?? 0) }
  });
}

let initialized = false;
export function initializeAnalytics(): void {
  if (initialized) return;
  initialized = true;
  captureAttribution();
  syncConsentProviders();
  trackPageView();
  document.addEventListener('click', trackWhatsAppClick, true);
  window.addEventListener('mobdeals:search-results', trackSearchResults);
  const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
  let searchTimer = 0;
  searchInput?.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      const count = Number(document.querySelector('[data-search-count]')?.textContent?.match(/\d+/)?.[0] ?? 0);
      trackEvent({ name: 'search', properties: { search_term: searchInput.value.trim().slice(0, 100), result_count: count } });
    }, 500);
  });
  window.addEventListener('mobdeals:consent-change', (event) => {
    if ((event as CustomEvent<{ analytics?: boolean }>).detail?.analytics) trackPageView();
  });
}
