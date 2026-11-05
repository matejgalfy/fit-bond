# Deployment (k3s)

FitBond runs on a single Linux VM with [k3s](https://k3s.io) (lightweight Kubernetes). CI builds the images,
a cron job on the server deploys them. Production: **[fitbond.me](https://fitbond.me)** (Azure VM, domain from
Namecheap, see [Domain](#domain-fitbondme)).

```
git push main ─▶ GitHub Actions (lint, tests) ─▶ images ghcr.io/matejgalfy/fitbond-{backend,web}:<sha>
                                                        │
server cron: scripts/deploy.sh every 5 min ◀────────────┘  (deploys once both images exist)

internet ─▶ Traefik (k3s ingress, TLS from cert-manager / Let's Encrypt)
              └─▶ web (Caddy: SPA, proxies /api + /uploads) ─▶ backend (Elysia) ─▶ db (Postgres 18)
```

| Path                                     | What                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `infra/k8s/`                             | Namespace `fitbond`: Postgres, backend, web, Ingress, nightly `pg_dump` backup |
| `infra/k8s/cluster/`                     | Once per cluster: Let's Encrypt `ClusterIssuer`, Traefik keeps client IPs      |
| `scripts/deploy.sh`                      | Deploys `origin/main` when its images are on GHCR (cron or by hand)            |
| `.env.production` (server only)          | All config and secrets; becomes the `fitbond-env` Secret on every deploy       |
| `.github/workflows/ci.yml` → job `images` | Builds both images; on `main` pushes `:<commit sha>` and `:latest` to GHCR    |

The public host comes from `FRONTEND_URL` in `.env.production`; `deploy.sh` writes it into the Ingress.
Google sign-in is optional: leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` empty to turn it off.

## One-time setup

### 1. VM (Azure)

- **Size:** Ubuntu Server 24.04 LTS **x64** (CI builds amd64 images only), 2 vCPU, 4 GB RAM (e.g. B2s / B2als_v2).
  The whole stack uses about 1.3 GB, so there is room for a second app in the same cluster.
- **Public IP:** VM → Overview → the public IP → Configuration: set **Assignment = Static** and a **DNS name
  label** (e.g. `fitbond`). That gives the host `fitbond.<region>.cloudapp.azure.com`; copy the exact name from
  the portal. Let's Encrypt issues certificates for it, so no own domain is needed. With an own domain, point an
  `A` record at the IP instead (see [Domain](#domain-fitbondme)).
- **Network security group** (VM → Networking → inbound rules): **80** and **443** from Any, **22** only from
  your own IP. Port **6443** (the k3s API) stays closed.

One public IP has only one Azure DNS label. A second app on the same VM needs another host name: a second
public IP with its own label, an own domain, or e.g. `<name>.<ip-with-dashes>.sslip.io`.

### 2. Server preparation

```bash
sudo apt update && sudo apt upgrade -y && sudo apt install -y git curl
# Firewall: SSH + web, and let k3s pods (10.42/16) and services (10.43/16) reach the node.
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp
sudo ufw allow from 10.42.0.0/16 to any && sudo ufw allow from 10.43.0.0/16 to any
sudo ufw enable
# 2 GB swap as a safety net on a 4 GB VM.
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. k3s

```bash
curl -sfL https://get.k3s.io | sh -
mkdir -p ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown "$USER" ~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc && export KUBECONFIG=~/.kube/config
kubectl get nodes        # STATUS Ready
```

`scripts/deploy.sh` uses `~/.kube/config` too (also from cron).

### 4. Cluster pieces (once per cluster)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.21.3/cert-manager.yaml
kubectl -n cert-manager rollout status deployment/cert-manager-webhook --timeout=5m
git clone https://github.com/matejgalfy/fit-bond.git ~/fit-bond && cd ~/fit-bond
kubectl apply -f infra/k8s/cluster/traefik-config.yaml
# Your email: Let's Encrypt sends certificate expiry warnings there.
sed 's/REPLACE_ME_EMAIL/you@example.com/' infra/k8s/cluster/cluster-issuer.yaml | kubectl apply -f -
```

### 5. Images on GHCR

CI pushes `ghcr.io/matejgalfy/fitbond-backend` and `fitbond-web` on every push to `main` (job `images`, after
lint and tests). New GHCR packages are **private**: after the first green run, set both to public (GitHub →
profile → Packages → package → Package settings → Change visibility → Public), or the server can't pull them.

### 6. `.env.production`

Lives only on the server, next to the checkout (gitignored); every variable is described in
[.env.production.example](../.env.production.example). This writes it with fresh secrets; set `HOST` first:

```bash
cd ~/fit-bond
HOST=fitbond.me    # or fitbond.<region>.cloudapp.azure.com without an own domain
PGPASS=$(openssl rand -hex 24)
cat > .env.production <<EOF
POSTGRES_USER=fitbond
POSTGRES_PASSWORD=$PGPASS
POSTGRES_DB=fitbond
DATABASE_URL=postgres://fitbond:$PGPASS@db:5432/fitbond
PORT=3000
BACKEND_URL=https://$HOST
BETTER_AUTH_URL=https://$HOST
FRONTEND_URL=https://$HOST
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LOCATIONIQ_API_KEY=
RESEND_API_KEY=re_dummy_test_key
EOF
chmod 600 .env.production
```

- **`POSTGRES_PASSWORD`** is also part of `DATABASE_URL`, so use URL-safe characters only (`openssl rand -hex`):
  `/`, `+`, `@` or `:` break the URL. It takes effect only when the database volume is first created.
- **`LOCATIONIQ_API_KEY`** is effectively required: creating an event needs the location search. Free key at
  [locationiq.com](https://locationiq.com).
- **Google sign-in:** leave both `GOOGLE_*` empty to disable it. To enable it, create an OAuth client in the
  Google Cloud Console (free, any Google account) with the redirect URI `https://<HOST>/api/auth/callback/google`.
- **`RESEND_API_KEY`** must not be empty; the dummy value works, emails just aren't delivered.
- No quotes around values: `kubectl --from-env-file` keeps them literally.

### 7. First deploy and cron

```bash
scripts/deploy.sh                     # deploys origin/main once its images are on GHCR
kubectl -n fitbond get pods           # db-0, backend-…, web-…: Running, 1/1
kubectl -n fitbond get certificate    # READY=True after a minute or two
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/fit-bond/scripts/deploy.sh >/dev/null 2>&1") | crontab -
```

### 8. First run of the app

The production database starts empty:

1. Open `https://<HOST>` and sign up.
2. Make yourself admin:
   `kubectl -n fitbond exec deploy/backend -- bun run admin:promote -- --email <your email>`
3. Create the sports (**events can't be created without any**). `scripts/create-sports.sh` adds the 15 most
   popular ones in one go (safe to re-run); a single one:
   `kubectl -n fitbond exec deploy/backend -- bun run sports:create -- --name Football`

Don't run `db:seed` in production: it inserts fake users and events.

## Domain (fitbond.me)

`fitbond.me` is registered at [Namecheap](https://www.namecheap.com) through the
[GitHub Student Developer Pack](https://education.github.com/pack) (a free `.me` domain for one year; after that
it renews at the normal price, so keep an eye on auto-renew in Namecheap → Domain List).
The SSL certificate offered with the pack isn't needed: cert-manager gets one from Let's Encrypt and renews it.

### DNS records

Namecheap → Domain List → `fitbond.me` → Manage. Nameservers: **Namecheap BasicDNS**. Advanced DNS:

| Type     | Host | Value                         | TTL   |
| -------- | ---- | ----------------------------- | ----- |
| A Record | `@`  | public IP of the VM (static!) | 5 min |

This must be the **only** `A` record for `@`. The student offer sets the domain up for GitHub Pages, so delete
the four `A` records `185.199.108–111.153` and a `CNAME www → *.github.io` if present. Otherwise visitors and
Let's Encrypt land on GitHub most of the time and the certificate is never issued. Add an `AAAA` record only if
the VM really serves IPv6; Let's Encrypt prefers it, and a dead one fails the validation.

```bash
dig +short fitbond.me A @dns1.registrar-servers.com   # Namecheap itself: only the VM's IP
dig +short fitbond.me A @1.1.1.1                       # what the internet sees
```

`www.fitbond.me` isn't set up: the Ingress serves exactly one host (the one in `FRONTEND_URL`).

### Changing the domain

Set DNS first and wait until `dig` shows the VM's IP. A certificate requested before that keeps failing and
retries with a growing backoff. Then, on the server:

```bash
cd ~/fit-bond && nano .env.production   # FRONTEND_URL, BACKEND_URL, BETTER_AUTH_URL = https://<new host>
scripts/deploy.sh --force               # rewrites the Ingress host; cert-manager requests a new certificate
kubectl -n fitbond get certificate      # READY=True after a minute or two
```

Then update the services that know the domain:

- **Google sign-in** (Google Cloud Console → APIs & Services → Credentials → the OAuth client): authorized
  JavaScript origin `https://<host>`, redirect URI `https://<host>/api/auth/callback/google`; on the OAuth consent
  screen add the domain to the authorized domains.
- **Resend** (only with a real `RESEND_API_KEY`): emails can only be sent from a domain verified in Resend. Add
  the domain there and create the DNS records it lists (DKIM `TXT resend._domainkey`, `MX` + SPF `TXT` on
  `send`) in Namecheap Advanced DNS. In the Host field, write only the part before `.fitbond.me`. MX records need
  Mail Settings → Custom MX. The sender address is set in `apps/backend/src/modules/email/email.service.ts`.

**"Could not resolve host" right after adding the record**, while `dig @1.1.1.1` already returns the IP: your
machine cached the earlier "no such domain" answer (Namecheap allows caching it for up to an hour). Flush it:
`sudo resolvectl flush-caches` (Linux, also on the VM), `ipconfig /flushdns` (Windows),
`chrome://net-internals/#dns` → Clear host cache (Chrome/Edge).

## Operations

```bash
kubectl -n fitbond get pods                       # status
kubectl -n fitbond logs deploy/backend -f         # backend logs
tail -f ~/fit-bond/deploy.log                     # deploy history
scripts/deploy.sh --force                         # redeploy now (e.g. after editing .env.production)

kubectl -n fitbond exec deploy/backend -- bun run sports:create -- --name Football
kubectl -n fitbond exec deploy/backend -- bun run admin:promote -- --email you@example.com   # sign up first
kubectl -n fitbond exec -it db-0 -- psql -U fitbond -d fitbond                                # SQL shell
kubectl -n fitbond get certificate                # TLS: READY should be True
```

**New version:** push to `main`; CI builds the images and cron deploys them within ~5 minutes. A commit whose
CI fails is never deployed; the next green one is.

**Rollback:** `git revert` the bad commit on `main` and push; CI and cron deploy the result like any other
change. (Checking out an older commit on the server doesn't help: cron moves it back to `origin/main`.)
Migrations don't roll back, so keep them backwards compatible with the previous version.

## Backups and restore

`db-backup` runs `pg_dump` daily at 02:30 (Europe/Bratislava) into the `backups` volume and keeps 14 days. The
files are on the VM under `/var/lib/rancher/k3s/storage/*_fitbond_backups/`, on the same disk as the database,
so copy them off the VM now and then. Uploaded images are in `*_fitbond_uploads/` next to it.

```bash
kubectl -n fitbond create job backup-now --from=cronjob/db-backup        # take one now
sudo ls -lh /var/lib/rancher/k3s/storage/*_fitbond_backups/
scp '<user>@<host>:/var/lib/rancher/k3s/storage/*_fitbond_backups/*.sql.gz' .   # needs read access (sudo cp first)

# Restore (replaces all data):
kubectl -n fitbond scale deploy/backend --replicas=0
kubectl -n fitbond exec -i db-0 -- psql -U fitbond -d fitbond \
  -c 'DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
gunzip -c fitbond-YYYY-MM-DD-HHMM.sql.gz | kubectl -n fitbond exec -i db-0 -- psql -v ON_ERROR_STOP=1 -U fitbond -d fitbond
kubectl -n fitbond scale deploy/backend --replicas=1
```

Replace `fitbond` after `-U` / `-d` with `POSTGRES_USER` / `POSTGRES_DB` if yours differ.

## Troubleshooting

| Symptom                                     | Look at                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `deploy.log`: images "not on GHCR yet"      | CI still running or red; or the GHCR packages are still private                             |
| Pod `ImagePullBackOff`                      | Same: package private, or no image for that SHA                                             |
| Pod `CreateContainerConfigError`            | `.env.production` lacks `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB`               |
| Backend `CrashLoopBackOff`                  | `kubectl -n fitbond logs deploy/backend`: usually a missing env var or a wrong `DATABASE_URL` |
| Browser certificate warning                 | `kubectl -n fitbond get certificate,challenges`; DNS must point at the VM, port 80 open     |
| Certificate `READY=False`, challenge `pending` | `dig +short <host> A @1.1.1.1` must return only the VM's IP (delete GitHub Pages records); `kubectl -n fitbond describe challenges` |
| `Could not resolve host`, public DNS is fine | Cached negative answer: `sudo resolvectl flush-caches` or wait up to an hour ([Domain](#domain-fitbondme)) |
| Event creation fails / no sports to pick    | Create sports (step 8); set `LOCATIONIQ_API_KEY` for the location search                   |
| Changed `POSTGRES_PASSWORD`, backend fails  | The password is set only when the volume is created; change it in `psql` too (`ALTER USER`) |
