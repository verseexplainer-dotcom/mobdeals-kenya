import provenance from '../../public/images/home/provenance.json';

const registered = provenance as Record<string, unknown>;
const hero = (name: string, legacy: string) => ({
  desktopSrc: `/images/home/${registered[`hero-${name}`] ? name : legacy}-desktop.webp`,
  mobileSrc: `/images/home/${registered[`hero-${name}`] ? name : legacy}-mobile.webp`
});
export const homeMedia = {
  student: hero('student', 'home-hero-laptops'),
  office: hero('office', 'home-hero-office-tech'),
  workstation: hero('workstation', 'home-hero-office-tech'),
  film: registered['film-mobdeals-scroll'] ? '/images/home/mobdeals-scroll.mp4' : undefined
};
