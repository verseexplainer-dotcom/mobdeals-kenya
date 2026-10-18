export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
}

export const consentStorageKey = 'mobdeals-consent-v1';
const consentCookieName = consentStorageKey;
const cookieLifetimeSeconds = 60 * 60 * 24 * 180;

export function hasGlobalPrivacyControl(): boolean {
  return typeof navigator !== 'undefined'
    && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function parseConsent(value: string | null | undefined): ConsentPreferences | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ConsentPreferences>;
    if (parsed.version !== 1 || typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing && !hasGlobalPrivacyControl(),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      version: 1
    };
  } catch {
    return null;
  }
}

function readConsentCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split('; ').find((part) => part.startsWith(`${consentCookieName}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(consentCookieName.length + 1));
  } catch {
    return null;
  }
}

export function readConsentPreferences(): ConsentPreferences | null {
  const sharedCookie = parseConsent(readConsentCookie());
  if (sharedCookie) return sharedCookie;
  try {
    const localConsent = parseConsent(localStorage.getItem(consentStorageKey));
    if (localConsent) writeConsentCookie(localConsent);
    return localConsent;
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: ConsentPreferences): void {
  try {
    const isMobDealsDomain = location.hostname === 'mobdeals.co.ke' || location.hostname.endsWith('.mobdeals.co.ke');
    const domain = isMobDealsDomain ? '; Domain=.mobdeals.co.ke' : '';
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${consentCookieName}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${cookieLifetimeSeconds}; SameSite=Lax${secure}${domain}`;
  } catch {
    // The local preference remains usable if browser cookie storage is unavailable.
  }
}

export function writeConsentPreferences(analytics: boolean, marketing: boolean): ConsentPreferences {
  const consent: ConsentPreferences = {
    necessary: true,
    analytics,
    marketing: marketing && !hasGlobalPrivacyControl(),
    updatedAt: new Date().toISOString(),
    version: 1
  };
  const value = JSON.stringify(consent);

  try {
    localStorage.setItem(consentStorageKey, value);
  } catch {
    // A shared cookie can still preserve the choice if localStorage is unavailable.
  }

  writeConsentCookie(consent);

  return consent;
}
