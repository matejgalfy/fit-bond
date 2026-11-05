# Deployment (k3s)

FitBond runs on a single Linux VM with [k3s](https://k3s.io) (lightweight Kubernetes). CI builds the images,
a cron job on the server deploys them.

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

Server: Ubuntu 24.04 x64, 2 vCPU, 4 GB RAM, ports 22, 80 and 443 open (port 6443 stays closed).

```bash
# k3s (Traefik included). With ufw on, let pods and services reach the node.
sudo ufw allow from 10.42.0.0/16 to any && sudo ufw allow from 10.43.0.0/16 to any
curl -sfL https://get.k3s.io | sh -
mkdir -p ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown "$USER" ~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc && export KUBECONFIG=~/.kube/config

# cert-manager + cluster pieces
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.21.3/cert-manager.yaml
kubectl -n cert-manager rollout status deployment/cert-manager-webhook --timeout=5m
git clone https://github.com/matejgalfy/fit-bond.git ~/fit-bond && cd ~/fit-bond
kubectl apply -f infra/k8s/cluster/traefik-config.yaml
sed 's/REPLACE_ME_EMAIL/you@example.com/' infra/k8s/cluster/cluster-issuer.yaml | kubectl apply -f -

# config, first deploy, cron
cp .env.production.example .env.production && nano .env.production
scripts/deploy.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * $HOME/fit-bond/scripts/deploy.sh >/dev/null 2>&1") | crontab -
```

GHCR packages start private: after the first CI run on `main`, set both `fitbond-backend` and `fitbond-web` to
public (GitHub → profile → Packages → package → Package settings → Change visibility), or the server can't pull them.

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

Rollback: `git -C ~/fit-bond checkout <older sha>` is not enough (cron moves it forward again); revert the
commit on `main` instead and let CI + cron deploy it. Migrations don't roll back, so keep them backwards compatible.

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
| Changed `POSTGRES_PASSWORD`, backend fails  | The password is set only when the volume is created; change it in `psql` too (`ALTER USER`) |
