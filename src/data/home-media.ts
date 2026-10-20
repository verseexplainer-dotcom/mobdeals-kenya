const provenance = {
  // Canonical hero asset names used by the storefront. These names are kept
  // free of generative/GPT labels so the marketing banner is easier to manage.
  ...
} as Record<string, unknown>;

const hero = (name: string, legacy: string) => ({
  desktopSrc: `/images/home/${provenance[`hero-${name}`] ? name : legacy}-desktop.webp`,
  mobileSrc: `/images/home/${provenance[`hero-${name}`] ? name : legacy}-mobile.webp`
});

export const homeMedia = {
  student: hero('student', 'home-hero-laptops'),
  office: hero('office', 'home-hero-office-tech'),
  workstation: hero('workstation', 'home-hero-smartphones'),
  film: provenance['film-mobdeals-scroll'] ? '/images/home/mobdeals-scroll.mp4' : undefined
};
