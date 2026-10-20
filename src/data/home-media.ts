import provenance from '../../public/images/home/provenance.json';

const registered = provenance as Record<string, unknown>;

const hero = (desktopName: string, mobileName: string) => ({
  desktopSrc: `/images/home/${desktopName}.webp`,
  mobileSrc: `/images/home/${mobileName}.webp`
});

export const homeMedia = {
  student: hero('mobdeals-hero-desktop', 'mobdeals-hero-mobile'),
  office: hero('mobdeals-hero-desktop', 'mobdeals-hero-mobile'),
  workstation: hero('mobdeals-hero-desktop', 'mobdeals-hero-mobile'),
  film: registered['film-mobdeals-scroll'] ? '/images/home/mobdeals-scroll.mp4' : undefined
};
