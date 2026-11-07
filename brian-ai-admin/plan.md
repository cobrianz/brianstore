# Brian’s AI Downloads Admin — implementation plan

## Scope and approach

Build a separate, downloadable Node.js admin application. The browser UI is served by Express; MongoDB stores editable text/catalog/order/subscriber records and admin sessions; Cloudflare R2 stores uploaded media and private customer downloads. The admin uses one environment-configured administrator, a secure session cookie, CSRF checks, and server-side validation. Product prices are stored as integer USD cents. An optional idempotent import command uploads the six current PDFs to private R2 and creates draft products.

The admin exposes same-origin public read endpoints for published catalog, guides, and site content, plus a newsletter endpoint. The existing public storefront is a separate application and still needs to be migrated to these shared data and fulfillment paths before admin edits or orders will affect it.

## Admin visual direction

Options considered: quiet botanical editorial console (0.06); high-contrast monochrome operations panel (0.04); playful multicolor creator dashboard (0.03). Chosen: **quiet botanical editorial console**—warm cream surfaces, forest-green navigation, restrained sage/gold highlights, serif page titles paired with system sans-serif controls, and a compact left-rail layout. It keeps the interface calm and legible for repetitive catalog work without decorative imagery.

## Main modules

- Authentication and dashboard overview.
- Product and free-guide CRUD, publication state, price/category metadata, and R2 object references.
- Orders list with payment state read-only and editable internal note only.
- Subscriber list, deletion, and CSV export.
- R2 file library with private/public upload prefixes, signed links, and deletion.
- Site copy editor for hero/about/newsletter text, ticker, FAQ, Actirova and social links.

## Project structure

- `server.js`: Express routes, authentication/session and CSRF middleware, MongoDB collections, R2 operations, upload validation, and storefront read endpoints.
- `public/index.html`, `public/styles.css`, `public/app.js`: responsive same-origin admin interface.
- `scripts/hash-password.js`: hidden-input bcrypt hash generator.
- `scripts/import-current-products.js`: optional six-PDF private R2/MongoDB importer.
- `seed-assets/`: the six existing downloadable PDFs used by that importer.
- `.env.example`, `README.md`, `API.md`: safe configuration, setup, and API contract.

## Dependencies and constraints

Requires Node.js 20+, a reachable MongoDB database, a Cloudflare R2 bucket and scoped S3-compatible credentials. This package intentionally contains no provider credentials and was not connected to external MongoDB/R2 services. It is a separate admin project ZIP, not a deployed/hosted admin URL. The current storefront integration remains a separate migration step.
