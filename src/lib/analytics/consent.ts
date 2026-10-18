import { syncConsentProviders } from './index';
import { hasGlobalPrivacyControl, readConsentPreferences, writeConsentPreferences } from './consent-storage';

function saveConsent(analytics: boolean, marketing: boolean) {
  const consent = writeConsentPreferences(analytics, marketing);
  window.dispatchEvent(new CustomEvent('mobdeals:consent-change', { detail: consent }));
  return consent;
}

function initializeConsentUi(): void {
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-consent-dialog]');
  if (!banner || !dialog || banner.dataset.initialized === 'true') return;
  banner.dataset.initialized = 'true';

  const analyticsToggle = dialog.querySelector<HTMLInputElement>('[data-consent-analytics]');
  const marketingToggle = dialog.querySelector<HTMLInputElement>('[data-consent-marketing]');
  const notice = dialog.querySelector<HTMLElement>('[data-consent-notice]');
  const gpcEnabled = hasGlobalPrivacyControl();

  const openPreferences = (message = '') => {
    const consent = readConsentPreferences();
    if (analyticsToggle) analyticsToggle.checked = consent?.analytics ?? false;
    if (marketingToggle) {
      marketingToggle.checked = consent?.marketing ?? false;
      marketingToggle.disabled = gpcEnabled;
    }
    if (notice) notice.textContent = message || (gpcEnabled ? 'Global Privacy Control is enabled; advertising and social media sharing remain off.' : '');
    if (!dialog.open) dialog.showModal();
  };

  const existing = readConsentPreferences();
  banner.hidden = existing !== null;
  syncConsentProviders();

  banner.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
    saveConsent(true, true);
    banner.hidden = true;
  });
  banner.querySelector('[data-consent-reject]')?.addEventListener('click', () => {
    saveConsent(false, false);
    banner.hidden = true;
  });
  banner.querySelector('[data-consent-manage]')?.addEventListener('click', () => openPreferences());

  dialog.querySelector('[data-consent-save]')?.addEventListener('click', () => {
    saveConsent(analyticsToggle?.checked ?? false, marketingToggle?.checked ?? false);
    banner.hidden = true;
    dialog.close();
  });
  dialog.querySelector('[data-consent-reject-all]')?.addEventListener('click', () => {
    saveConsent(false, false);
    banner.hidden = true;
    dialog.close();
  });
  dialog.querySelector('[data-consent-accept-all]')?.addEventListener('click', () => {
    saveConsent(true, true);
    banner.hidden = true;
    dialog.close();
  });
  document.querySelectorAll('[data-cookie-settings]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      openPreferences();
    });
  });
  dialog.querySelector('[data-consent-close]')?.addEventListener('click', () => dialog.close());
  document.querySelectorAll('[data-privacy-opt-out]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      const consent = readConsentPreferences();
      saveConsent(consent?.analytics ?? false, false);
      banner.hidden = true;
      openPreferences('Advertising and social media sharing has been turned off for this browser.');
    });
  });

  window.addEventListener('mobdeals:consent-change', syncConsentProviders);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeConsentUi, { once: true });
} else {
  initializeConsentUi();
}
