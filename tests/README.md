# Tests

No formal test harness is configured yet. Current verification is the production Astro build:

```sh
npm run build
```

The latest verified build completed successfully and generated 399 static pages.

Future test coverage should add:

- Smoke checks for key routes: home, shop, category, product, search, cart, and contact.
- Rendering checks for generated product pages and missing-image fallbacks.
- Accessibility checks for navigation, product cards, forms, and cart controls.
- Browser behavior checks for `localStorage` cart add/remove/update and WhatsApp checkout URL generation.
