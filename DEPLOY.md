# Deploy — Sensaciones

Recommended: **app on Vercel + domain managed in Hostinger.** Vercel runs
Next.js natively (free tier is plenty); Hostinger keeps your domain and just
points its DNS at Vercel. A self-hosted **VPS** alternative is at the bottom.

Prerequisite: finish [SETUP.md](./SETUP.md) first (Supabase project + schema +
seed), so the app has a database to read from in production.

---

## A. Vercel + Hostinger domain (recommended)

### 1. Put the code in a Git repo

Vercel deploys from GitHub/GitLab/Bitbucket.

```bash
cd sensaciones-app
git init
git add .
git commit -m "Sensaciones digital menu"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/<you>/sensaciones-app.git
git branch -M main
git push -u origin main
```

> `.env.local` is already git-ignored — your keys won't be pushed. Good.

### 2. Import into Vercel

1. https://vercel.com → **Add New → Project** → import the repo.
2. Framework preset auto-detects **Next.js**. Leave build settings default.
3. **Environment Variables** — add these (Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |

   > `SUPABASE_SERVICE_ROLE_KEY` is **not** needed on Vercel — it's only used by
   > the local `npm run seed`. Keep it off the server.

4. **Deploy.** You get a `*.vercel.app` URL — confirm the menu + `/admin` work.

### 3. Add your domain

In Vercel → Project → **Settings → Domains** → add `sensaciones.menu` (and
`www.sensaciones.menu`). Vercel shows the DNS records it needs.

### 4. Point Hostinger DNS at Vercel

In **Hostinger → hPanel → Domains → DNS / Nameservers** for your domain, add the
records Vercel asks for. Typically:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

(Use the exact values Vercel shows you — they can change.) Save. DNS propagation
takes minutes to a few hours; Vercel auto-issues the SSL certificate.

### 5. Done

- Public menu → `https://sensaciones.menu`
- Admin → `https://sensaciones.menu/admin`
- Generate a QR code pointing to `https://sensaciones.menu` for the tables.

### Updating the app later

Edit code → `git push`. Vercel rebuilds and redeploys automatically. **Your
Supabase data is untouched** — code and database are separate layers. Content
edits (dishes, prices, photos) are done in `/admin` and never need a redeploy.

---

## B. Self-hosted on your Hostinger VPS (alternative)

You own a VPS, so this is viable if you'd rather keep everything in Hostinger.

```bash
# On the VPS (Ubuntu example)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm i -g pm2

# Deploy the app
git clone https://github.com/<you>/sensaciones-app.git
cd sensaciones-app
npm ci
printf 'NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...\n' > .env.local
npm run build
pm2 start "npm run start" --name sensaciones   # serves on :3000
pm2 save && pm2 startup
```

Then put **nginx** in front as a reverse proxy + SSL (Certbot):

```nginx
server {
  server_name sensaciones.menu www.sensaciones.menu;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo certbot --nginx -d sensaciones.menu -d www.sensaciones.menu
```

Point the domain's `A` record to the VPS IP. To update later:
`git pull && npm ci && npm run build && pm2 restart sensaciones`.

**Trade-off vs Vercel:** you manage Node, nginx, SSL renewals and uptime
yourself. Vercel does all that automatically. For a restaurant menu, Vercel is
less maintenance — but the VPS keeps it 100% inside Hostinger.
