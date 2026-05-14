/*
  Typed design constants mirrored from ses_ict_hub_design_system/DESIGN.md.
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
    page: 'clamp(1rem, 4vw, 2rem)',
    section: 'clamp(3rem, 7vw, 6rem)',
    sectionSm: 'clamp(2rem, 5vw, 3.5rem)'
  },
  primaryAction: 'primary',
  whatsappAction: 'whatsapp',
  productCardRadius: '0.5rem',
  interactionDurationMs: 220
} as const;
