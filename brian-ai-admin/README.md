# Brian’s AI Downloads Admin

A separate, self-hosted admin dashboard for Brian’s AI digital-download shop. Product, guide, order, subscriber, and site-copy records are stored in MongoDB. Uploaded product files and media are stored in Cloudflare R2.

## What it manages

- **Dashboard:** product, guide, order, subscriber, and paid-revenue totals plus recent orders.
- **Products:** create, edit, publish/draft, feature, price, categorize, and attach a private R2 download plus a cover image.
- **Free guides:** manage titles, slugs, summaries, Markdown body, category, cover, public URL, and publication state.
- **Orders:** review customer, item, amount, Paystack reference, and payment state. Payment state is intentionally read-only; the dashboard cannot mark an order paid or change payment verification. It can save an internal support note.
- **Subscribers:** review, remove, and export contacts as CSV.
- **Files:** upload/list/delete R2 objects and open short-lived signed previews/download links.
- **Site content:** edit hero/about/newsletter text, ticker, Actirova link, FAQ entries, and social links.

## Requirements

- Node.js 20 or newer.
- A MongoDB database, such as MongoDB Atlas.
- A Cloudflare R2 bucket and an R2 S3-compatible API access key. The bucket should remain private; signed URLs are used for admin previews and private downloads.

## Configure and run

1. Extract the ZIP, open a terminal in the project folder, and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the MongoDB URI/database, Cloudflare account/access credentials, bucket, and a random session secret. Never put `.env` in a public repository or send it in a ZIP.
3. Generate an admin password hash by running `npm run hash-password` in an interactive terminal. The utility hides password input and requires 12–72 UTF-8 bytes (bcrypt’s supported password-length range). Copy the resulting bcrypt hash into `ADMIN_PASSWORD_HASH` and set `ADMIN_EMAIL` in `.env`.
4. Set `COOKIE_SECURE=true` when serving the dashboard over HTTPS. Set `TRUST_PROXY=true` only when the app is behind a trusted reverse proxy.
5. Run `npm start`, then visit `http://localhost:4180` (or your configured `PORT`).

MongoDB stores collections named `products`, `guides`, `orders`, `subscribers`, `site_content`, and `admin_sessions`. Indexes are created on first start. Prices are stored as integer cents (for example, `$5.00` is `500`). Admin sessions are stored in MongoDB and expire after eight hours.

### Import the existing six starter products

The ZIP includes the six existing shop PDFs in `seed-assets/`. After you configure MongoDB and R2, run `npm run import:current-products`. It uploads each PDF under a private R2 key and creates the matching `$5.00` product record in MongoDB as a **draft**. Existing product records with an assigned file are skipped. Review descriptions, covers, and settings before publishing.

### Seed the free guides

With the admin app's `.env.local` configured for the intended MongoDB database, run `npm run seed:free-guides`. The script inserts six published guides only when their slugs do not already exist, so rerunning it leaves existing guide records unchanged. Their public URLs point to the storefront's `/guides/[slug]` pages.

### R2 values

Your R2 bucket is `brian-storage`; `R2_ROOT_PREFIX=resources` places this app's objects under the `resources/` key prefix (R2 uses object-key prefixes rather than real folders). Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET`. `R2_ENDPOINT` defaults from the account ID. This app writes covers beneath `resources/public/` and product downloads beneath `resources/private/`. `R2_PUBLIC_BASE_URL` is optional and, when used, must be an HTTPS custom domain deliberately configured for public cover assets. The storefront API returns a durable cover URL only when that HTTPS base is configured—it never signs a private object or returns an expiring cover link. Without the public domain, the product remains available but has no public cover URL. Upload limit is 100 MB per file.

## Public-store API and integration note

The admin project includes public read endpoints for published products, guides, and site content (`/api/storefront/products`, `/api/storefront/guides`, `/api/storefront/content`) and a newsletter endpoint (`POST /api/storefront/subscribers`). They provide a future integration point for the storefront.

**Important:** this ZIP is a new, separate admin project. Brian’s current public storefront still uses its existing static product/catalog and local JSON/PDF storage. It does not automatically read these new MongoDB/R2 collections, and its Paystack callback does not write orders into this new MongoDB database. To have admin edits immediately change the live storefront and populate the Orders tab, the public storefront must also be migrated to these shared APIs/collections and its checkout fulfillment wired to the same R2 bucket. That migration requires the MongoDB and R2 configuration values and is not performed by this admin-only ZIP.

## Security notes

- No admin password, MongoDB URI, R2 key, or `.env` file is included in this archive.
- The server requires a configured MongoDB URI, a 32-character-or-longer session secret, and a bcrypt password hash before it starts.
- The dashboard uses an HTTP-only, same-site session cookie, Mongo-backed sessions, CSRF tokens on mutations, login/upload rate limits, Helmet security headers, and no cross-origin API access.
- Admin order controls never alter payment status. Public downloads/payment verification remain the responsibility of the storefront/payment backend.
- Keep R2 download objects private and restrict the R2 API token to the bucket this app needs.
