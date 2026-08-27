# Deploying to the VPS

Native install, no Docker. Nginx terminates TLS and proxies to Next.js on
`127.0.0.1:3000`; Postgres runs on the same host over a local socket.

## If you are using FastPanel

FastPanel manages nginx and issues the certificates, so do **not** hand-copy
`deploy/nginx.conf` over its config — it will be overwritten. Instead:

1. **Sites → Add site** for `developwitharim.com`, site type **"Proxying"**
   (or "Node.js" if offered), backend `http://127.0.0.1:3000`.
2. **SSL** → issue/attach the Let's Encrypt certificate and enable *force HTTPS*.
3. In the site's **nginx settings → additional directives**, paste the
   `location` and `limit_req` blocks from `deploy/nginx.conf`. The important one
   is `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` — without
   it every visitor looks like `127.0.0.1`, and the rate limiter will block all
   of them at once the moment one person is over the limit.
4. Databases → create the `dwa` database and user there rather than by hand.
5. The systemd unit in step 7 is still needed: FastPanel proxies to the Node
   process, it does not run it for you.

The rest of this file applies unchanged.

## 1. Packages

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y nginx postgresql certbot python3-certbot-nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Database

```bash
sudo -u postgres psql -c "CREATE ROLE dwa LOGIN PASSWORD 'USE_A_LONG_RANDOM_ONE';"
sudo -u postgres psql -c "CREATE DATABASE dwa OWNER dwa;"
```

Use a long random password here, not the local dev one. It lives only in
`/etc/dwa-site.env`, so nobody has to type or remember it:

```bash
openssl rand -base64 32
```

## 3. Service user and code

```bash
sudo useradd --system --home /var/www/dwa-site --shell /usr/sbin/nologin dwa
sudo mkdir -p /var/www/dwa-site
sudo chown dwa:dwa /var/www/dwa-site

sudo -u dwa git clone <your-repo> /var/www/dwa-site
cd /var/www/dwa-site
sudo -u dwa npm ci
```

## 4. Environment

Secrets go in a root-owned file the service user can read — never in the unit
file, because `systemctl cat` is world-readable.

```bash
sudo install -m 640 -o root -g dwa /dev/null /etc/dwa-site.env
sudo tee /etc/dwa-site.env >/dev/null <<'ENV'
DATABASE_URL=postgresql://dwa:THE_PASSWORD@localhost:5432/dwa
DATABASE_SSL=false

NEXT_PUBLIC_SITE_URL=https://developwitharim.com

# openssl rand -hex 32
AUTH_SECRET=
IP_HASH_SALT=

SMTP_HOST=_dc-mx.9e37593b5c94.developwitharim.com
SMTP_PORT=587
SMTP_USER=no-reply@developwitharim.com
SMTP_PASSWORD=
SMTP_FROM="Digital Web Assurances <no-reply@developwitharim.com>"
SMTP_TLS_SERVERNAME=mail.developwitharim.com
LEAD_NOTIFY_TO=admin@developwitharim.com

# Optional: enables the performance half of the audit.
PAGESPEED_API_KEY=
ENV
```

**SMTP note.** `developwitharim.com` resolves to Cloudflare, which proxies HTTP
only — port 587 there times out. `SMTP_HOST` must be the MX host. Its name
contains underscores, which are illegal in TLS SNI, hence `SMTP_TLS_SERVERNAME`.

**Mail TLS.** Verified working with full certificate validation. The subtlety is
SNI: the MX hostname contains underscores (illegal in TLS SNI) and is not listed
in the certificate's SAN, so sending it makes the server fall back to a
self-signed default and the handshake fails. `SMTP_TLS_SERVERNAME` sends the apex
name instead, which the Let's Encrypt certificate covers
(`DNS:developwitharim.com, DNS:www.developwitharim.com`).

Only if you move to a host without a valid certificate would you need
`SMTP_TLS_REJECT_UNAUTHORIZED=false` — that is encrypted but **not**
authenticated, and it logs a warning on every boot so it cannot be forgotten.

## 5. Migrate and build

```bash
cd /var/www/dwa-site
sudo -u dwa --preserve-env env $(sudo cat /etc/dwa-site.env | xargs) npm run db:migrate
sudo -u dwa npm run build:standalone   # build + copies public/ and .next/static
```

**Why the environment must be injected.** The standalone server resolves `.env`
files relative to its own directory (`.next/standalone`), not the project root,
so a `.env.local` at the top level is silently ignored and every database call
fails with *"DATABASE_URL is not set"*. The systemd `EnvironmentFile` in step 7
is what makes this work in production. To run the same build locally, use
`npm run start:prod`, which loads the project's env files and hands them to the
server process.

## 6. Create the admin user

```bash
cd /var/www/dwa-site
sudo -u dwa --preserve-env env $(sudo cat /etc/dwa-site.env | xargs) \
  node scripts/create-admin.mjs admin@developwitharim.com "Siddik Arim"
```

## 7. systemd

```bash
sudo cp deploy/dwa-site.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now dwa-site
sudo systemctl status dwa-site
curl -s localhost:3000/api/health   # {"ok":true,"db":"up",...}
```

## 8. Nginx and TLS

```bash
sudo cp deploy/proxy_params /etc/nginx/proxy_params
sudo cp deploy/nginx.conf /etc/nginx/sites-available/dwa-site
sudo ln -sf /etc/nginx/sites-available/dwa-site /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d developwitharim.com -d www.developwitharim.com
sudo systemctl enable --now certbot.timer   # auto-renewal
```

### Cloudflare

The domain is proxied. Either:

- set SSL/TLS mode to **Full (strict)** so Cloudflare validates the origin
  certificate, or
- grey-cloud the record and let nginx serve TLS directly.

Do **not** leave it on Flexible: that serves HTTPS to visitors while talking
plain HTTP to the origin, and the `Strict-Transport-Security` header this app
sends would then be a promise the setup does not keep.

## 9. Firewall

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

Postgres and Next.js bind to localhost only and must never be exposed.

## Updating

```bash
cd /var/www/dwa-site
sudo -u dwa git pull
sudo -u dwa npm ci
sudo -u dwa --preserve-env env $(sudo cat /etc/dwa-site.env | xargs) npm run db:migrate
sudo -u dwa npm run build
sudo -u dwa cp -r public .next/standalone/public
sudo -u dwa cp -r .next/static .next/standalone/.next/static
sudo systemctl restart dwa-site
```

## Backups

The leads table is the commercial asset. Nightly dump:

```bash
sudo tee /etc/cron.daily/dwa-backup >/dev/null <<'SH'
#!/bin/sh
mkdir -p /var/backups/dwa
sudo -u postgres pg_dump dwa | gzip > /var/backups/dwa/dwa-$(date +%F).sql.gz
find /var/backups/dwa -name '*.sql.gz' -mtime +30 -delete
SH
sudo chmod +x /etc/cron.daily/dwa-backup
```

Copy those off the box — a backup that only exists on the server it protects is
not a backup.
