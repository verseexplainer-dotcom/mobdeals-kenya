const attributionStorageKey = 'mobdeals-attribution-v1';
const attributionCookieName = attributionStorageKey;

export interface SessionAttribution {
  leadId: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  gclid: string;
  fbclid: string;
  ttclid: string;
  referrer: string;
  landingPage: string;
  capturedAt: string;
}

function clean(value: string | null | undefined, maxLength = 120): string {
  const withoutControls = Array.from(String(value ?? ''))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');
  return withoutControls.trim().slice(0, maxLength);
}

function makeLeadId(): string {
  const random = globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 8).toUpperCase();
  return `MD-${random || Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function referrerHost(): string {
  if (!document.referrer) return '';
  try {
    const host = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, '');
    return host === 'mobdeals.co.ke' || host.endsWith('.mobdeals.co.ke') ? '' : host;
  } catch {
    return '';
  }
}

function sourceFrom(referrer: string): { source: string; medium: string } {
  if (!referrer) return { source: 'direct', medium: 'none' };
  const host = referrer.toLowerCase();
  if (/(^|\.)google\./.test(host) || host === 'google.com') return { source: 'google', medium: 'organic' };
  if (/(^|\.)bing\.com$/.test(host)) return { source: 'bing', medium: 'organic' };
  if (/(^|\.)yahoo\./.test(host)) return { source: 'yahoo', medium: 'organic' };
  if (/(^|\.)duckduckgo\.com$/.test(host)) return { source: 'duckduckgo', medium: 'organic' };
  if (/(^|\.)tiktok\.com$/.test(host)) return { source: 'tiktok', medium: 'referral' };
  if (/(^|\.)facebook\.com$|(^|\.)instagram\.com$/.test(host)) return { source: 'meta', medium: 'referral' };
  return { source: host, medium: 'referral' };
}

function readStoredAttribution(): SessionAttribution | null {
  try {
    const stored = sessionStorage.getItem(attributionStorageKey);
    const cookie = document.cookie.split('; ').find((part) => part.startsWith(`${attributionCookieName}=`));
    const cookieValue = cookie ? decodeURIComponent(cookie.slice(attributionCookieName.length + 1)) : null;
    const raw = stored || cookieValue;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionAttribution>;
    if (typeof parsed.leadId !== 'string' || typeof parsed.source !== 'string') return null;
    return {
      leadId: parsed.leadId,
      source: parsed.source,
      medium: typeof parsed.medium === 'string' ? parsed.medium : 'none',
      campaign: typeof parsed.campaign === 'string' ? parsed.campaign : '',
      term: typeof parsed.term === 'string' ? parsed.term : '',
      content: typeof parsed.content === 'string' ? parsed.content : '',
      gclid: typeof parsed.gclid === 'string' ? parsed.gclid : '',
      fbclid: typeof parsed.fbclid === 'string' ? parsed.fbclid : '',
      ttclid: typeof parsed.ttclid === 'string' ? parsed.ttclid : '',
      referrer: typeof parsed.referrer === 'string' ? parsed.referrer : '',
      landingPage: typeof parsed.landingPage === 'string' ? parsed.landingPage : location.pathname,
      capturedAt: typeof parsed.capturedAt === 'string' ? parsed.capturedAt : ''
    };
  } catch {
    return null;
  }
}

export function captureAttribution(): SessionAttribution {
  const existing = readStoredAttribution();
  if (existing) return existing;

  const params = new URLSearchParams(location.search);
  const referrer = referrerHost();
  const inferred = sourceFrom(referrer);
  const utmSource = clean(params.get('utm_source'));
  const utmMedium = clean(params.get('utm_medium'));
  const gclid = clean(params.get('gclid'));
  const fbclid = clean(params.get('fbclid'));
  const ttclid = clean(params.get('ttclid'));
  const clickSource = gclid ? 'google' : fbclid ? 'meta' : ttclid ? 'tiktok' : '';
  const clickMedium = gclid ? 'cpc' : (fbclid || ttclid) ? 'paid_social' : '';
  const captured: SessionAttribution = {
    leadId: makeLeadId(),
    source: utmSource || clickSource || inferred.source,
    medium: utmMedium || clickMedium || inferred.medium,
    campaign: clean(params.get('utm_campaign')),
    term: clean(params.get('utm_term')),
    content: clean(params.get('utm_content')),
    gclid,
    fbclid,
    ttclid,
    referrer,
    landingPage: clean(`${location.pathname}${location.hash}`, 500),
    capturedAt: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(attributionStorageKey, JSON.stringify(captured));
  } catch {
    // Attribution is best-effort and must never block browsing or checkout.
  }
  try {
    const isMobDealsDomain = location.hostname === 'mobdeals.co.ke' || location.hostname.endsWith('.mobdeals.co.ke');
    const domain = isMobDealsDomain ? '; Domain=.mobdeals.co.ke' : '';
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${attributionCookieName}=${encodeURIComponent(JSON.stringify(captured))}; Path=/; SameSite=Lax${secure}${domain}`;
  } catch {
    // Cross-subdomain attribution is best-effort; local session storage still works.
  }
  return captured;
}

export function getAttribution(): SessionAttribution {
  return readStoredAttribution() ?? captureAttribution();
}

export function formatLeadReference(attribution = getAttribution()): string {
  const source = clean(attribution.source, 40) || 'direct';
  const medium = clean(attribution.medium, 40);
  const campaign = clean(attribution.campaign, 70);
  const origin = [source, medium, campaign].filter(Boolean).join(' / ');
  return `[Ref: ${origin} | ID: ${clean(attribution.leadId, 20)}]`;
}

export function getAttributionEventProperties(): Record<string, string> {
  const attribution = getAttribution();
  return {
    lead_id: attribution.leadId,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    referrer: attribution.referrer,
    landing_page: attribution.landingPage
  };
}
