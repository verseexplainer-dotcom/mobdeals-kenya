/*
  Typed design constants mirrored from ai/skills/design_system.md.
  CSS tokens remain the runtime source; use this file when TypeScript code needs shared names.
*/
export const designConfig = {
  container: {
    xs: '480px',
    sm: '640px',
    md: '896px',
    lg: '1152px',
    xl: '1280px',
    full: 'none'
  },
  spacing: {
    page: 'clamp(1.25rem, 4vw, 2rem)',
    section: 'clamp(4rem, 8vw, 7.5rem)',
    sectionSm: 'clamp(3rem, 6vw, 4.5rem)'
  },
  primaryAction: 'primary',
  whatsappAction: 'primary',
  productCardRadius: '1.25rem',
  interactionDurationMs: 220
} as const;
