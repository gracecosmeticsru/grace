# Grace hero campaigns

This update changes only the homepage hero. The header, promotional navigation, catalogue, product cards and all other homepage sections are preserved. The hero is isolated in `components/hero.tsx` and `components/hero.module.css`.

Three original AI-generated editorial campaign photographs are supplied as 1536 × 1024 PNGs: `hero-k-beauty.png`, `hero-luxury-makeup.png`, and `hero-autumn-skincare.png`. They were generated with the built-in image-generation tool, one request per scene, and visually inspected before integration. Models and cosmetic still lifes are illustrative; unbranded objects are not represented as photographs of specific catalogue products. Existing product-image mappings are unchanged.

Desktop presentation retains the full height of each photograph to preserve faces and foreground products, with a soft CSS blend into the matching banner surface. Mobile presentation places an independently framed photograph above the text and CTA, avoiding text over faces. No raster edits or invented brand labels were added.

Each slide has a short heading, one short supporting phrase, and one linked CTA. K-Beauty opens the existing K-Beauty collection. Luxury makeup opens the existing makeup catalogue filtered to luxury brands. Autumn skincare opens the existing daily facial-care section. No new catalogue structure or selection is introduced.

Swipe, arrow controls, numbered slide selection, the all-campaigns dialog, and pause/play controls are provided. Autoplay pauses on hover, keyboard focus, manual navigation and when the selection dialog is open; reduced-motion preferences disable initial autoplay. The first image loads eagerly with high priority, with later images marked lazy.

Validation: original image inspection, TypeScript check, production build and source-boundary checks. Browser visual QA was not run; the earlier browser security-policy restriction was not retried.
