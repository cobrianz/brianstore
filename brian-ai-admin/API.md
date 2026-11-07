# Admin API contract

All routes are same-origin. Admin routes require a logged-in session. Mutating admin routes require `X-CSRF-Token`, returned by `GET /api/auth/me` and `POST /api/auth/login`.

| Route | Method | Purpose |
|---|---:|---|
| `/api/health` | GET | App/database and R2 configuration status (never returns secrets) |
| `/api/auth/login` | POST | Sign in with the one configured admin account |
| `/api/auth/me` | GET | Current admin and CSRF token |
| `/api/auth/logout` | POST | End session |
| `/api/admin/dashboard` | GET | Summary metrics and recent orders |
| `/api/admin/products` | GET/POST | List/create products |
| `/api/admin/products/:id` | PATCH/DELETE | Edit/delete product metadata |
| `/api/admin/guides` | GET/POST | List/create free guides |
| `/api/admin/guides/:id` | PATCH/DELETE | Edit/delete guide metadata |
| `/api/admin/orders` | GET | Read orders (payment status is read-only) |
| `/api/admin/orders/:id/note` | PATCH | Save internal support note only |
| `/api/admin/subscribers` | GET | List subscriber records |
| `/api/admin/subscribers/:id` | DELETE | Delete subscriber record |
| `/api/admin/subscribers/export.csv` | GET | Download subscriber CSV |
| `/api/admin/files` | GET/DELETE | List or delete an R2 object |
| `/api/admin/files/upload` | POST | Multipart R2 upload; `kind=public` or `private` |
| `/api/admin/files/signed?key=...` | GET | Create a 15-minute signed R2 URL |
| `/api/admin/content` | GET/PUT | Read/update the site-content singleton |
| `/api/storefront/products` | GET | Public, published product metadata only; no private file keys |
| `/api/storefront/guides` | GET | Public, published guide summaries |
| `/api/storefront/content` | GET | Public site-content fields |
| `/api/storefront/subscribers` | POST | Add a newsletter subscriber |

Products use `priceCents` integer values and `status: draft|published`. Guides use `status: draft|published`. Order payment fields cannot be changed through admin endpoints. R2 objects are named under the configured root prefix (`resources/` by default in Brian's setup), then `public/` or `private/`; no private file key is exposed through public product JSON.

## R2 key and cover URL rules

Product and guide cover keys must be under `<R2_ROOT_PREFIX>/public/`. Product download keys must be under `<R2_ROOT_PREFIX>/private/` (Brian's configured root is `resources/`). Public product/guide JSON includes a durable `coverUrl` only when `R2_PUBLIC_BASE_URL` is set to a valid HTTPS custom domain and the stored cover key is safe and under `public/`; otherwise `coverUrl` is empty. The storefront API never signs or reveals private objects. Admin file-preview links remain short-lived signed URLs.
