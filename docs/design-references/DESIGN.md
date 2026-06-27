---
name: MobDeals Kenya Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434656'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737687'
  outline-variant: '#c3c5d9'
  surface-tint: '#004fe4'
  primary: '#0047cc'
  on-primary: '#ffffff'
  primary-container: '#155dfc'
  on-primary-container: '#eceeff'
  inverse-primary: '#b6c4ff'
  secondary: '#006d2f'
  on-secondary: '#ffffff'
  secondary-container: '#5dfd8a'
  on-secondary-container: '#007232'
  tertiary: '#992f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c33e00'
  on-tertiary-container: '#ffebe5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#003baf'
  secondary-fixed: '#66ff8e'
  secondary-fixed-dim: '#3de273'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-xl:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.5rem
  sm: 0.75rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  xxl: 5rem
  gutter: 1.5rem
  container-max: 1280px
---

## Brand & Style

The design system establishes a high-trust, authoritative presence for a premium electronics retailer in Nairobi. It balances technical precision with retail accessibility, positioning the brand as a modern, reliable hub for authentic technology. 

The visual style is **Corporate / Modern** with a focus on clean eCommerce efficiency. It utilizes a cool-toned color palette and generous whitespace to evoke a sense of "freshness" and "originality" essential for hardware retail. Depth is created through subtle tonal shifts rather than heavy shadows, ensuring a fast-paced, high-performance feel across all digital touchpoints.

## Colors

The palette is anchored by a vibrant **Primary Blue**, signaling technological expertise and reliability. This is complemented by a functional **WhatsApp Green**, specifically reserved for direct customer communication and conversion-focused CTAs.

Surface levels use a tiered system of cool blues and greys. `#f8fbff` is used for secondary backgrounds, while `#dceafe` provides emphasis for active states or highlighted product categories. Typography remains strictly high-contrast for maximum legibility, using `#0b1220` for structural headings to create a clear visual anchor on the page.

## Typography

This design system exclusively utilizes **Manrope**, a geometric sans-serif that strikes a balance between professional utility and modern tech aesthetics. 

Hierarchy is established through weight transitions—800 for impactful hero displays down to 400 for long-form product descriptions. Line heights are kept generous (1.6) for body text to ensure readability on mobile screens. For product tags and metadata, use the `label-xs` style with bold weight and increased letter spacing to distinguish technical specifications from general content.

## Layout & Spacing

The system follows a **Fixed Grid** model for desktop, centered within a 1280px container, and a **Fluid Grid** for mobile devices. A 12-column system is utilized for desktop, transitioning to 2 columns on mobile for product listings.

Rhythm is maintained through a base-8 scaling system, though specific increments of `0.5rem` to `5rem` are applied to create distinct separation between product categories. Vertical rhythm should prioritize `2.5rem` (lg) for section spacing to maintain the "clean" eCommerce aesthetic. Mobile layouts should reduce global margins to `1rem` while maintaining inner component padding for touch targets.

## Elevation & Depth

Visual depth is achieved through **Tonal Layering** and **Low-Contrast Outlines**. Surfaces do not use heavy drop shadows; instead, they rely on 1px borders in `#dbe5f3` and subtle background shifts. 

Active states for cards or interactive elements may use a soft "ambient" shadow: `0 8px 24px rgba(15, 23, 42, 0.06)`. This keeps the interface light and fast. High-elevation components like navigation bars or fixed "Add to Cart" bars on mobile use a background-blur effect with a semi-transparent white fill to maintain context with the content underneath.

## Shapes

The shape language is "Rounded," prioritizing a friendly yet structured feel. Small components like input fields and buttons utilize the `0.75rem` radius. Larger containers, such as product cards and hero banners, use the `1.3rem` radius to create a soft, modern containerization.

Pill shapes (`999px`) are reserved exclusively for badges (e.g., "In Stock", "New Arrival") and the primary floating WhatsApp button to ensure they stand out as distinct interactive or informative elements.

## Components

### Buttons
Primary buttons use a solid `#155dfc` fill with white text and a `0.75rem` radius. Hover states transition over `0.22s` to `#0b4ee8`. WhatsApp-specific actions must use `#25d366` and include the brand icon. Secondary buttons should use the `#f8fbff` background with a `#dbe5f3` border.

### Input Fields
Inputs use a white background, `#dbe5f3` border, and `0.75rem` radius. Focus states should transition the border color to `#155dfc` with a subtle `2px` glow of the same color at 10% opacity.

### Cards
Product cards utilize the `1.3rem` radius and a `1px` border. Images within cards should have a `0.5rem` inset padding or be clipped to the card's top radius. Ensure a consistent white background for card containers to make product photography pop.

### Transitions
Standard interactions (hovers, toggles) use the `0.22s` (fast) duration. Page-level transitions, such as drawer openings or modal entries, use the `0.36s` (slow) duration with a `cubic-bezier(0.4, 0, 0.2, 1)` easing for a professional, fluid feel.

### Additional Components
- **Inventory Badges:** Small pill-shaped labels with `label-xs` typography.
- **Price Displays:** Use `headline-lg` in `#0b1220` with a `body-sm` muted text for "Before" prices (strikethrough).
- **Technical Specs Table:** Use alternating row colors with `#f8fbff` for enhanced scanability.