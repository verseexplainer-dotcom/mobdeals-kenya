export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
}

/*
  Static-first analytics boundary.
  Wire Cloudflare Web Analytics or another lightweight client here later without touching UI components.
*/
export function trackEvent(_event: AnalyticsEvent): void {
  return;
}
