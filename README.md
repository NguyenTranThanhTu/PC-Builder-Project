# Free eCommerce Template for Next.js - NextMerce

The free Next.js eCommerce template is a lite version of the NextMerce Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![NextMerce](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)

While NextMerce Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### NextMerce Free VS NextMerce Pro

| ✨ Features                   | 🎁 NextMerce Free | 🔥 NextMerce Pro             |
| ----------------------------- | ----------------- | ---------------------------- |
| Next.js Pages                 | Static            | Dynamic Boilerplate Template |
| Components                    | Limited           | All According to Demo        |
| eCommerce Functionality       | Included          | Included                     |
| Integrations (DB, Auth, etc.) | Not Included      | Included                     |
| Community Support             | Included          | Included                     |
| Premium Email Support         | Not Included      | Included                     |
| Lifetime Free Updates         | Included          | Included                     |

#### [🚀 Live Demo](https://demo.nextmerce.com/)

#### [🌐 Visit Website](https://nextmerce.com/)

## Backend (Pro) Quick Start — Added

This project has been extended with a backend scaffold to enable:

- Authentication via Google (NextAuth)
- PostgreSQL database (Prisma)
- Admin access allowlist using `ADMIN_EMAILS`
- Initial data models for electronics components and compatibility rules

### 1) Environment variables

Copy `.env.example` to `.env.local` and fill in values:

- `DATABASE_URL` — your Postgres connection string
- `NEXTAUTH_URL` — usually `http://localhost:3000` for dev
- `NEXTAUTH_SECRET` — a strong random string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `ADMIN_EMAILS` — comma-separated admin emails

### 2) Install dependencies

Run in `nextjs-ecommerce-template/`:

```powershell
npm install
```

### 3) Generate Prisma Client

```powershell
npm run prisma:generate
```

If your database is ready, you can also run migration (creates tables):

```powershell
npm run prisma:migrate
```

### 4) Start the app

```powershell
npm run dev
```

Visit `http://localhost:3000/admin` — if you are signed in with an email listed in `ADMIN_EMAILS`, you’ll access the Admin Dashboard shell.

> Note: The Admin UI is a basic shell now; product and order management plus compatibility checks will be added next.

## 🛠 Admin API (Current Sprint)

The free template was extended with initial admin endpoints (RBAC guarded via `requireAdmin()`). All endpoints live under `/api/admin/*` and require a session with an email in `ADMIN_EMAILS` or role `ADMIN`.

### Auth & RBAC

`src/lib/auth.ts` exports `requireAdmin()` used by routes to return `403` if unauthorized.

### Products

| Method | Path                      | Description                                                                                                                        |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/admin/products`     | List products with pagination & filters (`page,pageSize,q,category,featured,status,sort,order`). Excludes `ARCHIVED` by default.   |
| POST   | `/api/admin/products`     | Create product + attributes. Accepts `price` or `priceCents`, generates unique slug, validates attributes by value type.           |
| GET    | `/api/admin/products/:id` | Fetch full product (category + attributes).                                                                                        |
| PATCH  | `/api/admin/products/:id` | Partial update; supports optimistic concurrency via `updatedAt` (ISO). Slug uniqueness maintained. Attributes replaced atomically. |
| DELETE | `/api/admin/products/:id` | Soft-archive (sets `status=ARCHIVED`, `archivedAt`). No hard delete performed.                                                     |

Product status lifecycle: `DRAFT | PUBLISHED | ARCHIVED` via enum `ProductStatus` in Prisma. Archived products hidden in default listing.

### Categories

| Method | Path                        | Description                                                                        |
| ------ | --------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/api/admin/categories`     | List categories.                                                                   |
| POST   | `/api/admin/categories`     | Create category with unique slug.                                                  |
| GET    | `/api/admin/categories/:id` | Fetch single category.                                                             |
| PATCH  | `/api/admin/categories/:id` | Update name and/or slug with uniqueness enforcement. Revalidates product listings. |
| DELETE | `/api/admin/categories/:id` | Delete only if no products reference the category.                                 |

### Upload

| Method | Path                | Description                                                                                                                                 |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/admin/upload` | Accepts `file` form field. Validates type (`jpeg,png,webp,avif`) & size (<=5MB), stores in `public/uploads/`, returns `{url, blurDataUrl}`. |

### Revalidation

`src/lib/revalidate.ts` provides async helpers:

- `revalidateProductListing()` revalidates listing pages (`/shop-with-sidebar`, `/shop-without-sidebar`, `/`).
- `revalidateProductDetail(slug)` revalidates product detail `/shop/[slug]`.
- `revalidateAfterProductChange(slug?)` combines both; called after create/update/archive.

### Optimistic Concurrency (PATCH Product)

Send `updatedAt` (ISO string) from last fetch. If mismatch -> `409` with `currentUpdatedAt`. Client should refresh, resolve conflicts, retry.

### Attribute Templates

`src/lib/attributeTemplates.ts` maps category slug -> array of `{ key,label,valueType }` for dynamic admin form rendering.

### Validation

Zod schemas in `src/lib/validators/product.ts` (`productCreateSchema`, `productUpdateSchema`) + helper `validateAttributesAgainstTypes` enforce value type integrity.

## 📄 Request Samples

See `docs/admin.http` for ready-to-run examples (VS Code REST Client or Thunder Client). Adjust IDs and auth cookies/session after login.

## 🚀 Next Steps (Roadmap)

1. Admin product creation UI (dynamic attribute form, image upload, status control).
2. Categories PATCH/DELETE surface in admin UI.
3. Storefront migration to fully DB-driven product list (remove static demo entries).
4. Compatibility rule builder (CPU ↔ Mainboard socket, PSU wattage vs GPU TDP, etc.).
5. Recommendation engine (suggest compatible components).
6. API docs expansion + automated tests (Vitest) for critical endpoints.
