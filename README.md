# Sensaciones — Menú Digital

Digital menu + admin panel for **Sensaciones Restaurant** (Cuban cuisine, Fort
Myers FL), built from the design handoff prototypes.

- **Public menu** (`/`) — mobile web app for the QR code. Bilingual EN/ES,
  hero slideshow, sticky category nav, Today's Special banner, dish cards with
  photo/video swipe, badges, detail sheet, Google review CTA, analytics.
- **Admin panel** (`/admin`) — desktop app for Oscar: menu CRUD, Today's
  Special, daily availability toggles, settings and an Insights dashboard.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth +
Storage + Realtime) · deployable to Vercel.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000  (preview mode, no DB needed)
```

The app runs immediately on bundled seed data (`src/lib/data/dishes.ts`). To
connect the real database, storage and login, follow **[SETUP.md](./SETUP.md)**.

```bash
npm run build    # production build
npm run seed     # load 70+ dishes + photos into Supabase (after SETUP)
```

See [SETUP.md](./SETUP.md) for the full Supabase walkthrough and project layout.

> Tip: in preview mode, open `/admin?demo=1` to skip the login wall and explore
> the admin (only works when Supabase is not yet connected).
