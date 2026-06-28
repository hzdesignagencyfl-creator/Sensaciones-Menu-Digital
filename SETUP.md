# Sensaciones — Setup Guide

This app runs in **two modes**:

- **Preview mode** (no setup) — the menu and admin work immediately using bundled
  seed data. Admin changes are not saved. Good for development and demos.
- **Connected mode** — backed by Supabase. Real persistence, realtime
  availability sync, photo uploads, analytics and a real admin login.

Follow the steps below to go from preview → connected.

---

## 0. Run in preview mode (right now)

```bash
npm install
npm run dev
```

- Public menu → http://localhost:3000
- Admin panel → http://localhost:3000/admin (sign in with **any** email + password)

You'll see a "preview mode" note in the admin until Supabase is connected.

---

## 1. Create a Supabase project

1. Go to https://supabase.com → **New project**.
2. Pick a name (e.g. `sensaciones`), a strong database password, and a region
   close to Fort Myers (e.g. `us-east-1`).
3. Wait ~2 minutes for it to provision.

## 2. Get your API keys

Project → **Settings → API**. Copy:

| Value | Goes into |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (keep secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

Paste them into **`.env.local`**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## 3. Create the database schema

Supabase Dashboard → **SQL Editor → New query** → paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql) → **Run**.

Then do the same with [`supabase/storage.sql`](./supabase/storage.sql) (creates
the photo/video buckets and their access policies).

## 4. Seed the menu (70+ dishes + photos)

```bash
npm run seed
```

This uploads the dish photos to Storage and inserts every dish, the Today's
Special, and default settings. Safe to re-run.

## 5. Create the admin login (Oscar)

Dashboard → **Authentication → Users → Add user** → enter Oscar's email +
password → **Create user** (tick "Auto Confirm User").

That email/password is what he'll use at `/admin`.

## 6. Run

```bash
npm run dev
```

- Menu now reads from Supabase. The "preview mode" note disappears.
- Toggle a dish's availability in the admin → the public menu updates live
  (realtime) without a reload.

---

## Deploying to Vercel

1. Push this folder to a Git repo and import it at https://vercel.com/new.
2. Add the same three env vars (Project → Settings → Environment Variables).
   `SUPABASE_SERVICE_ROLE_KEY` is only needed if you run the seed from CI — it is
   **not** used by the running app.
3. Deploy. Point your domain (`sensaciones.menu`) at the Vercel project.
4. Generate a QR code to `https://sensaciones.menu` for the tables.

---

## Project structure

```
src/
  app/
    page.tsx              Public menu (Server Component → MenuApp)
    admin/page.tsx        Admin panel
    api/analytics/route.ts  Analytics ingest endpoint
  components/
    menu/                 Public menu UI (Hero, DishCard, DishModal, …)
    admin/                Admin UI (Sidebar, sections/…)
  lib/
    data/dishes.ts        Canonical 70+ dish dataset (seed source + fallback)
    data/menu-meta.ts     Categories, badges, strings, hero images, settings
    data-service.ts       Server-side menu fetch (Supabase + local fallback)
    admin-service.ts      Admin CRUD (Supabase browser client)
    supabase/             Browser / server / admin clients
    analytics.ts          Client analytics helpers
supabase/
  schema.sql              Tables, RLS, triggers, realtime, default settings
  storage.sql             Storage buckets + policies
scripts/seed.ts           Seeds dishes, photos, special, settings
public/images/            Dish photos + logo
```

## How fallback works

Every data path checks `isSupabaseConfigured()`. With no keys, the app uses the
bundled dataset in `src/lib/data/dishes.ts` so nothing crashes. Once keys are
present, the same code reads/writes Supabase. This means you can build, demo and
deploy the UI before the database exists.
