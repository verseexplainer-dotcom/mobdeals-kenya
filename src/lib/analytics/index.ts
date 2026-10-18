import { readConsentPreferences } from './consent-storage';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

type Consent = { analytics: boolean; marketing: boolean };
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};
type QueuedTrackingFunction = ((...args: unknown[]) => void) & { q?: unknown[][]; queue?: unknown[][]; loaded?: boolean; version?: string };

function getConsent(): Consent | null {
  const stored = readConsentPreferences();
  return stored ? { analytics: stored.analytics, marketing: stored.marketing } : null;
}

function addScript(id: string, src: string): HTMLScriptElement | null {
  if (document.getElementById(id)) return null;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.append(script);
  return script;
}

function loadAnalytics(): void {
  const browser = window as AnalyticsWindow;
  const gaId = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID?.trim();
  if (gaId && !browser.gtag) {
    const dataLayer = (window as Window & { dataLayer?: unknown[][] }).dataLayer ?? [];
    const queue = dataLayer;
    browser.gtag = (...args: unknown[]) => queue.push(args);
    (window as Window & { dataLayer?: unknown[][] }).dataLayer = queue;
    browser.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    browser.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    browser.gtag('js', new Date());
    browser.gtag('config', gaId, { anonymize_ip: true, send_page_view: false });
    addScript('mobdeals-ga4', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
  }

  const siteRole = document.documentElement.dataset.siteRole;
  const clarityId = siteRole === 'marketing'
    ? import.meta.env.PUBLIC_CLARITY_MARKETING_PROJECT_ID?.trim()
    : import.meta.env.PUBLIC_CLARITY_SHOP_PROJECT_ID?.trim();
  if (clarityId && !browser.clarity) {
    const queue: unknown[][] = [];
    const clarity = ((...args: unknown[]) => queue.push(args)) as QueuedTrackingFunction;
    clarity.q = queue;
    browser.clarity = clarity;
    addScript('mobdeals-clarity', `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`);
    browser.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  }
}

function loadMarketing(): void {
  const browser = window as AnalyticsWindow;
  const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID?.trim();
  if (pixelId && !browser.fbq) {
    const fbq = ((...args: unknown[]) => fbq.queue?.push(args)) as QueuedTrackingFunction;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    browser.fbq = fbq;
    browser.fbq('init', pixelId);
    browser.fbq('track', 'PageView');
    addScript('mobdeals-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  // AdSense was previously attached to the storefront layout, not the marketing site.
  if (document.documentElement.dataset.siteRole === 'shop') {
    const adsClientId = import.meta.env.PUBLIC_GOOGLE_ADS_CLIENT_ID?.trim() || 'ca-pub-9876261469782990';
    if (adsClientId) {
      const script = addScript('mobdeals-adsense', `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsClientId)}`);
      if (script) script.crossOrigin = 'anonymous';
      document.getElementById('mobdeals-adsense')?.setAttribute('crossorigin', 'anonymous');
    }
  }
}

export function syncConsentProviders(): void {
  const consent = getConsent();
  if (!consent) return;
  const browser = window as AnalyticsWindow;
  if (!consent.marketing) browser.fbq?.('consent', 'revoke');
  else if (browser.fbq) browser.fbq('consent', 'grant');
  if (consent.analytics) loadAnalytics();
  if (consent.marketing) loadMarketing();
  browser.gtag?.('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied'
  });
  browser.clarity?.('consentv2', {
    ad_Storage: consent.marketing ? 'granted' : 'denied',
    analytics_Storage: consent.analytics ? 'granted' : 'denied'
  });
}

export function trackEvent(event: AnalyticsEvent): void {
  const consent = getConsent();
  if (!consent) return;

  const browser = window as AnalyticsWindow;
  if (consent.analytics) {
    browser.gtag?.('event', event.name, event.properties ?? {});
    browser.clarity?.('event', event.name);
  }
  if (consent.marketing && browser.fbq) {
    const standardEvent = event.name === 'lead_whatsapp_click'
      ? 'Contact'
      : event.name === 'begin_checkout'
        ? 'InitiateCheckout'
        : event.name === 'page_view'
          ? 'PageView'
          : event.name === 'view_item'
            ? 'ViewContent'
            : event.name === 'add_to_cart'
              ? 'AddToCart'
              : null;
    browser.fbq(standardEvent ? 'track' : 'trackCustom', standardEvent ?? event.name, event.properties ?? {});
  }
}
