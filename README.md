# MangoShop

A full-stack mango e-commerce web application: a customer storefront with categories, cart and
checkout, plus a role-protected admin panel for managing products, categories, orders and customers.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma** and
**PostgreSQL**.

---

## Why this stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | Next.js + React + TypeScript | Server-rendered product pages so Google can index them — a client-only SPA ships a blank page to crawlers. |
| Styling | Tailwind CSS v4 | The whole palette lives in one `@theme` block in `globals.css`; change a colour there and the site follows. |
| Backend | Next.js Route Handlers (`src/app/api/**`) | One project, one deploy. No separate Express server to run and keep in sync. |
| Database | PostgreSQL + Prisma | Orders and products are relational. Prisma gives type-safe queries and migrations. |
| Auth | JWT in an httpOnly cookie (`jose` + `bcryptjs`) | ~80 lines you can read and explain, with no third-party auth library to break on upgrade. |

---

## Getting started

### 1. Requirements

- Node.js 18.18 or newer
- A PostgreSQL database — local, or a free one from [Neon](https://neon.tech) or
  [Supabase](https://supabase.com)

### 2. Install

```bash
npm install
```

### 3. Configure the environment

Copy `.env.example` to `.env` and fill in the three values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mangoshop?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/mangoshop?schema=public"
AUTH_SECRET="a-long-random-string-at-least-32-characters"
```

`DATABASE_URL` is what the app queries through; `DIRECT_URL` is what `db:push` and
`db:studio` use. With a local PostgreSQL server they are identical. On a hosted database with
connection pooling (Neon, Supabase) `DATABASE_URL` is the **pooled** string and `DIRECT_URL` is
the **direct** one — schema changes cannot go through a pooler.

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Create the tables and add sample data

```bash
npm run db:push     # creates the tables from prisma/schema.prisma
npm run db:seed     # 5 categories, 18 mangoes, 2 demo accounts
```

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mangoshop.lk` | `Admin@123` |
| Customer | `customer@mangoshop.lk` | `Customer@123` |

Sign in as the admin and the account menu gains an **Admin panel** link, or go straight to
`/admin`.

---

## What's included

**Storefront**

- Home page with hero, category grid, featured picks and newest arrivals
- Product listing with category filter, sort (price, name, newest) and text search
- Product detail page with quantity selector, stock status and related products
- Cart that survives a page refresh (localStorage), with a free-delivery progress bar
- Checkout with delivery details, order summary and cash-on-delivery
- Order history and a per-order tracking page with a progress timeline
- Sign in / register, 404 page, About page

**Admin panel** (`/admin`, admins only)

- Dashboard: revenue, order count, live products, customers, recent orders, low-stock list
- Products: searchable table, create, edit, delete (products used in an order are hidden instead of
  deleted so order history survives)
- Categories: create, edit and delete inline; deletion is blocked while products still use it
- Orders: filter by status and change status from the table — cancelling returns the stock
- Customers: every account with order count and lifetime value

---

## Project layout

```
prisma/
  schema.prisma          Database models
  seed.ts                Sample categories, products and users
public/mangoes/          Product artwork (SVG)
scripts/
  generate-images.mjs    Regenerates the placeholder artwork
src/
  app/
    page.tsx             Home
    products/            Listing + detail
    categories/          Category index
    cart/                Cart
    checkout/            Checkout form
    orders/              Order history + order detail
    login/  register/    Auth screens
    about/               About page
    admin/               Admin panel (layout guards the whole section)
    api/                 REST route handlers
  components/            Shared UI, plus components/admin for the panel
  context/CartContext    Cart state
  lib/
    prisma.ts            Database client
    session.ts           Signing and verifying the session cookie
    auth.ts              getSession / requireUser / requireAdmin
    api.ts               JSON helpers and the API guard
    validators.ts        Zod schemas for every form and endpoint
    format.ts            Prices, dates, slugs, delivery fee
  middleware.ts          Blocks /admin, /checkout and /orders for signed-out visitors
```

---

## API

All mutating endpoints validate their input with Zod and check the session server-side.

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | public |
| GET | `/api/products` | public — supports `?q=`, `?category=`, `?sort=`, `?featured=1` |
| POST | `/api/products` | admin |
| GET · PATCH · DELETE | `/api/products/:id` | GET public, the rest admin |
| GET | `/api/categories` | public |
| POST | `/api/categories` | admin |
| PATCH · DELETE | `/api/categories/:id` | admin |
| GET | `/api/orders` | your own orders; admins see all |
| POST | `/api/orders` | signed in |
| GET | `/api/orders/:id` | owner or admin |
| PATCH | `/api/orders/:id` | admin — changes the status |

---

## Security notes

- Passwords are hashed with bcrypt (cost 10) and never leave the server.
- The session is a signed JWT in an httpOnly, SameSite=Lax cookie — JavaScript on the page cannot
  read it. It is marked `secure` automatically in production.
- **Order prices come from the database, never from the browser.** The checkout request sends only
  product IDs and quantities; the server looks up the real price and stock before writing the order.
- Every admin page is guarded twice: in `middleware.ts` and again in the page itself through
  `requireAdmin()`.
- Stock is decremented inside the same transaction that creates the order, so two people cannot buy
  the last box at once.

---

## Replacing the product artwork

`public/mangoes/` holds hand-drawn SVG illustrations so the shop looks finished before you have
photographs. To use real photos, drop them into `public/mangoes/` and set the product's image to
`/mangoes/your-photo.jpg` in the admin panel — or paste a full URL from any image host. Run
`node scripts/generate-images.mjs` to regenerate the illustrations after editing the script.

---

## Deploying to Vercel

There is no separate backend to deploy. The API routes under `src/app/api` become serverless
functions on Vercel automatically, and `middleware.ts` runs at the edge. One repository, one
deploy. Only the database lives elsewhere — it stays on Neon (or wherever you host PostgreSQL) and
both your machine and Vercel connect to it.

1. Push the project to GitHub. `.env` is git-ignored, so your secrets stay off GitHub.
2. Import the repository on [Vercel](https://vercel.com). It detects Next.js — leave the build
   settings alone.
3. Add three environment variables in Vercel before the first deploy:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the **pooled** Neon string (hostname contains `-pooler`) |
   | `DIRECT_URL` | the **direct** Neon string |
   | `AUTH_SECRET` | a fresh random string — not the one from your machine |

4. Deploy. `npm run build` runs `prisma generate` first, so the client always matches the schema.

The database schema is pushed from your machine (`npm run db:push`), not from Vercel — the build
does not touch your data. Seed once locally with `npm run db:seed` and production has the data.

For a real shop, switch from `db:push` to migrations: run `npx prisma migrate dev --name init`
locally, commit the `prisma/migrations` folder, and change the build script to
`prisma generate && prisma migrate deploy && next build`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Load the sample data |
| `npm run db:studio` | Prisma Studio — browse the data in the browser |
