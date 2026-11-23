# Server setup

How the production server was built, so it can be built again from nothing. One Hetzner Cloud VPS in the EU runs
the Compose stack from `deploy/compose.yaml`; the domain stays at OVH and its DNS zone points at the server.

| Piece        | Choice                                                                    |
|--------------|---------------------------------------------------------------------------|
| Provider     | Hetzner Cloud, location Falkenstein, Nuremberg (Germany) or Helsinki      |
| Server type  | CPX02 (x86, 1 vCPU, 1 GB RAM, 20 GB disk) plus a 1 GB swap file          |
| Image        | Ubuntu 26.04 LTS                                                          |
| First boot   | `deploy/cloud-init.yaml`                                                  |
| Login        | `deploy` by SSH key; no root login, no passwords                          |
| Firewall     | Hetzner Cloud Firewall: TCP 22, 80, 443, UDP 443, ICMP                    |
| Updates      | `unattended-upgrades`, kernel updates reboot at 04:00 UTC                 |
| Logs         | Containers log to journald, kept 14 days (at most 1 GB)                   |
| App folder   | `/home/deploy/workouterr` (`compose.yaml`, `.env`)                        |

**Why so small:** nothing is built on the server; the images are built on the Mac or in GitHub Actions and only loaded and run here.
At idle Ubuntu with Docker, PostgreSQL, the API and Caddy use about 500–600 MB, which serves a single user. The swap
file absorbs short spikes. When it gets tight, Rescale with "CPU and RAM only" keeps the disk at 20 GB, so the server
can be scaled back down later. (The Arm types and the larger x86 ones were unavailable or expensive when it was
ordered in November 2026.)

**x86 on an Arm Mac:** `api.Dockerfile` cross-compiles, and the deploy script builds for `linux/amd64`.

**Why a cloud firewall and not `ufw`:** Docker publishes container ports by writing its own iptables rules, ahead of
`ufw`'s, so `ufw` can't block a published port. Hetzner's firewall filters before traffic reaches the server.

## 1. SSH key

The Mac's key is `~/.ssh/id_ed25519`. Without one: `ssh-keygen -t ed25519`, with a passphrase.

## 2. Hetzner Cloud

In the [Cloud Console](https://console.hetzner.cloud), in a project for Workouterr:

1. **Firewall** (Firewalls → Create Firewall), named `workouterr`. Inbound rules, each from any IPv4 and IPv6:
   TCP 22 (SSH), TCP 80 (Let's Encrypt and the redirect to HTTPS), TCP 443 (HTTPS), UDP 443 (HTTP/3), ICMP (ping).
   Outbound: none, which allows everything.
2. **Server** (Servers → Add Server):
   - Location and type from the table; image Ubuntu 26.04.
   - Networking: public IPv4 and IPv6.
   - SSH keys: add the public key (`cat ~/.ssh/id_ed25519.pub`). The server doesn't use it (cloud-init sets the keys),
     but without one Hetzner emails a root password.
   - Firewalls: `workouterr`.
   - Cloud config: `deploy/cloud-init.yaml` with the key under `ssh_authorized_keys` replaced by the same public key.
     The edited copy is not committed.
   - Name: `workouterr`.
3. Note the server's IPv4 and IPv6 addresses. cloud-init needs a few minutes after the server shows as running.

### Without cloud config at creation

A server created without the cloud config gets it afterwards: the file goes into cloud-init's own config folder, and
`cloud-init clean` makes the next boot count as the first one, so everything above runs once. The first boot also
creates new SSH host keys, hence the `ssh-keygen -R`.

Settings in that folder are cloud-init's weakest source: Hetzner's vendor data overrides them, and user data (the
"Cloud config" field) overrides both. A list such as `runcmd` is replaced, not merged, which is why the file has
none. A user that already exists is skipped, so on a server where `deploy` was created earlier, joining the docker
group needs `sudo usermod -aG docker deploy` and a new login.

```sh
# On the Mac: a copy with your public key, outside the repo
sed "s|ssh-ed25519 AAAA...replace-with-your-public-key|$(cat ~/.ssh/id_ed25519.pub)|" deploy/cloud-init.yaml \
  > ~/workouterr-cloud-init.yaml
scp ~/workouterr-cloud-init.yaml root@<IPv4 address>:/etc/cloud/cloud.cfg.d/99-workouterr.cfg
ssh root@<IPv4 address> 'cloud-init schema -c /etc/cloud/cloud.cfg.d/99-workouterr.cfg && cloud-init clean --logs --reboot'

# A few minutes later: forget the old host key, then log in as deploy
ssh-keygen -R <IPv4 address>
ssh deploy@<IPv4 address> 'cloud-init status --wait --long'
```

Running it again later (root is locked out by then) goes through `deploy`:
`scp` the copy to `deploy@<IPv4 address>:/tmp/99-workouterr.cfg`, then
`sudo install -o root -g root -m 644 /tmp/99-workouterr.cfg /etc/cloud/cloud.cfg.d/99-workouterr.cfg` and the same
`schema` and `clean` commands with `sudo`.

After the reboot root can't log in over SSH. If `deploy` can't either (a wrong key), the Hetzner console's web
terminal (Console button) still logs in as root with a password; Rescue → Reset root password sets one if needed.

## 3. DNS at OVH

The domain's zone is in the OVH Control Panel → Web Cloud → Domain names → the domain → DNS zone.

1. Check what the zone already holds, so nothing in use is overwritten:
   `dig +short A <domain>`, `dig +short AAAA <domain>`, `dig +short MX <domain>`, `dig +short TXT <domain>`. If the
   bare domain already serves a site or mail, use a subdomain (e.g. `workouterr.<domain>`).
2. Add (or replace) for the chosen name: an `A` record with the IPv4 address and an `AAAA` record with the IPv6
   address. A TTL of 300 seconds while setting up makes mistakes cheap to fix; raise it to 3600 later. Hetzner shows
   the IPv6 network (`…::/64`); the server's own address in it is `…::1` (`ssh workouterr 'ip -6 addr'`).

`workouterr.app` itself is the app's name. Its zone came with OVH's hosting page: `A` records on the bare domain and
`www`, and a `TXT` record `1|www.workouterr.app` (OVH's marker for an attached hosting plan). The bare domain's `A`
now points at the server, `www` and the marker are deleted, and the `MX` and SPF records for OVH's mail stay as they
are.
3. Check from the Mac once the zone has refreshed (minutes, sometimes up to an hour):
   `dig +short A <name>` and `dig +short AAAA <name>` print the server's addresses.

Caddy asks Let's Encrypt for a certificate the first time the stack starts with `WORKOUTERR_DOMAIN` set, so the
records must resolve before that.

## 4. SSH alias on the Mac

In `~/.ssh/config`, so `ssh workouterr` (and the deploy script) finds the server:

```
Host workouterr
  HostName <IPv4 address>
  User deploy
  IdentityFile ~/.ssh/id_ed25519
```

The first `ssh workouterr` asks to trust the server's host key; answer `yes`.

## 5. Check the server

```sh
ssh workouterr 'cloud-init status --long'          # status: done, no errors
ssh workouterr 'docker compose version'             # Docker Compose version v…
ssh workouterr 'sudo sshd -T | grep -E "^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication) "'
                                                    # permitrootlogin no, the other two no
ssh -o PubkeyAuthentication=no workouterr           # Permission denied (publickey).
ssh root@<IPv4 address>                             # Permission denied (publickey).
ssh workouterr 'systemctl is-active unattended-upgrades'   # active
ssh workouterr 'swapon --show && free -h'           # /swapfile 1024M; about 700 MB available before the stack
ssh workouterr 'docker info --format {{.LoggingDriver}}'   # journald
ssh workouterr 'systemd-analyze cat-config systemd/journald.conf | grep -E "^(Storage|MaxRetentionSec|SystemMaxUse)="'
                                                    # persistent, 14day, 1G
nc -z -v -w 5 <IPv4 address> 8080                   # Operation timed out: the firewall drops it
dig +short A workouterr.app; dig +short AAAA workouterr.app   # the server's two addresses
```

A closed port on a server with no firewall answers "Connection refused" at once; a timeout means the firewall dropped
the packet before it arrived.

If cloud-init reports an error, `ssh workouterr 'sudo cat /var/log/cloud-init-output.log'` shows each command's output.

## 6. Secrets

`~/workouterr/.env` (in `deploy`'s home) holds the values from `deploy/.env.example`. It is created on the server, so
the database password never passes through the Mac:

```sh
ssh workouterr 'mkdir -p ~/workouterr && umask 077 \
  && printf "POSTGRES_PASSWORD=%s\nWORKOUTERR_DOMAIN=%s\n" "$(openssl rand -hex 32)" <name> > ~/workouterr/.env \
  && ls -l ~/workouterr/.env'   # -rw------- 1 deploy deploy …
```

`umask 077` makes the new file `600` (owner read and write only). A hex password has no characters that need quoting
in the connection string. Keep a copy of the file in a password manager: the password is fixed into the database when
its volume is first created.

## 7. Deploying

`deploy/deploy.sh` (from `deploy/`) deploys the current commit; nothing is built on the server. The script:

1. Refuses a dirty working tree, checks for `GITHUB_PACKAGES_TOKEN`, Docker and the SSH alias.
2. Runs every check: `dotnet format --verify-no-changes`, `dotnet build`, the OpenAPI check, `dotnet test`, then
   `npm ci`, ESLint, Prettier, the API client check, `npm run build` and the unit tests (and the end-to-end tests
   once they exist, unless `--skip-e2e`). A failure stops it before anything leaves the Mac.
3. Builds both images for `linux/amd64` (`DOCKER_DEFAULT_PLATFORM`), with the same tags as a local build.
4. Streams them with `docker save | gzip | ssh workouterr 'gunzip | docker load'` (about 150 MB) and copies
   `compose.yaml` into `~/workouterr`.
5. On the server: `docker compose run --rm migrations`, then `docker compose up -d --wait --no-build`, then
   `docker image prune -f` (the replaced images, now untagged). The server has no source: `up --no-build`
   ignores the `build:` sections in `compose.yaml`, and `run` (no such flag) builds only when an image is missing.
6. `curl https://<domain>/api/health` must answer `{"status":"Healthy"}`. The domain comes from the server's `.env`,
   and the request goes to the server's address from the SSH config (`curl --resolve`), so a stale DNS cache can't
   send the check to another machine.

After a DNS change, caches (the router's too) keep the old record until its TTL runs out. Then the browser reaches
the old address, while public resolvers (`dig @1.1.1.1 workouterr.app`) already give the new one. `server: Kestrel`
in the response headers (`curl -sI https://workouterr.app/api/health`) shows the request reached this server.

The first deploy is also when Caddy gets its Let's Encrypt certificate (DNS must resolve, section 3).

### Automatic deploy from GitHub Actions

`.github/workflows/ci.yml` runs the same checks as the script on every pull request into main (jobs `API` and
`Web`). A merge into main runs them again on main, then the `Deploy` job:

1. Builds both images on the runner (already `linux/amd64`) and pushes them to GHCR as
   `ghcr.io/rrzadca/workouterr-{api,caddy}:<commit SHA>`. The packages are private (made so by hand
   once, setup step 5): the Caddy image bundles radinf-ui.
2. On the server, logs in to GHCR with the job's own `GITHUB_TOKEN` (it expires when the job ends) into a throwaway
   Docker config, pulls the images and tags them `workouterr-api` / `workouterr-caddy`, the names `compose.yaml` and
   `deploy.sh` use. No registry credential stays on the server.
3. Copies `compose.yaml`, runs the migrations, `up -d --wait --no-build`, prunes, and checks `/api/health`, as in
   steps 5 and 6 above.
4. Deletes all but the last 10 versions of each image in GHCR.

The run is under Actions → CI; a failed check stops it before anything is pushed. `deploy.sh` still works from the
Mac, and both leave the server in the same state. A rollback is a revert merged into main; re-running an old run's
`Deploy` job also works while its images are among the last 10, but the migrations only go forward, so an older API
then runs against the newer schema.

One-time setup, from the Mac:

```sh
# 1. A key only for CI, without a passphrase (a runner can't type one), allowed to log in as deploy
ssh-keygen -t ed25519 -N '' -C workouterr-github-actions -f ~/.ssh/workouterr-github-actions
ssh workouterr 'cat >> ~/.ssh/authorized_keys' < ~/.ssh/workouterr-github-actions.pub

# 2. The production environment: only main may deploy to it, and only its jobs see its secrets
gh api -X PUT repos/rrzadca/workouterr/environments/production --input - <<'EOF'
{"deployment_branch_policy": {"protected_branches": false, "custom_branch_policies": true}}
EOF
gh api -X POST repos/rrzadca/workouterr/environments/production/deployment-branch-policies -f name=main -f type=branch

# 3. Its secrets: the key, the server's address and its host key (from the Mac's known_hosts, already trusted)
address=$(ssh -G workouterr | awk '/^hostname /{print $2}')
gh secret set DEPLOY_SSH_KEY --env production < ~/.ssh/workouterr-github-actions
gh secret set DEPLOY_SSH_HOST --env production --body "$address"
ssh-keygen -F "$address" | grep -v '^#' | gh secret set DEPLOY_SSH_KNOWN_HOSTS --env production
```

4. radinf-ui's package (github.com/users/rrzadca/packages/npm/radinf-ui/settings) → Manage Actions access → add
   `workouterr` with Read, so the workflow's token can install it.
5. After the first deploy, make both packages private. The images' `org.opencontainers.image.source` label links
   them to this repository, and a package linked to a public repository is created public. For each of
   `workouterr-api` and `workouterr-caddy`: github.com/users/rrzadca/packages/container/<name>/settings → Danger
   Zone → Change visibility → Private (the API has no call for this). They stay linked, so the workflow's token
   still pushes, pulls and deletes versions. Check: `gh api /user/packages/container/<name> --jq .visibility`
   prints `private` (needs `gh auth refresh -h github.com -s read:packages` once).
6. Branch protection on main, once the checks have run on a pull request, so GitHub knows their names:

```sh
gh api -X PUT repos/rrzadca/workouterr/branches/main/protection --input - <<'EOF'
{"required_status_checks": {"strict": false, "contexts": ["API", "Web"]},
 "enforce_admins": true, "required_pull_request_reviews": null, "restrictions": null}
EOF
```

`enforce_admins` applies the rule to the owner too, so nothing reaches main (and the server) without passing the
checks. To replace the CI key: generate a new one, swap the line in `~/.ssh/authorized_keys` and set
`DEPLOY_SSH_KEY` again.

## 8. First user

The API's CLI runs in a one-off `api` container; `-t` gives it a terminal, so the password is asked for with hidden
input:

```sh
ssh -t workouterr 'cd ~/workouterr && docker compose run --rm api user create <email>'
```

## 9. Uptime check

A free external monitor (UptimeRobot) requests `https://workouterr.app/api/health` every 5 minutes and emails when it
fails: a non-200 means the API or the database is down, a timeout means the server or Caddy is. Monitor type Keyword
(`Healthy`, alert when it is missing), alert contact the owner's email. A plain HTTP(s) monitor would only check for a
200, which another server answering for the domain (the old hosting, after a DNS change) gives too. The endpoint returns only `{"status":"Healthy"}`, so nothing personal leaves the
server.

## 10. Logs and errors

The API writes one JSON object per log line to its console; Docker's journald log driver (`/etc/docker/daemon.json`)
hands every container's output to the system journal, which keeps 14 days and at most 1 GB
(`/etc/systemd/journald.conf.d/00-workouterr.conf`). The journal belongs to the server, so the logs outlive the
containers each deploy replaces. Both files come from `deploy/cloud-init.yaml`, which also puts `deploy` in the
`systemd-journal` group: without it, `journalctl` shows a user only their own entries.

There is no external error tracker: the error log is the tracker. The API logs every unhandled exception at `Error`,
and the Angular app sends the errors nothing in it caught to `POST /api/client-errors`, which logs them the same way
(category `Workouterr.ClientErrors`). A line carries the user's ID (`UserId` in `Scopes`) when someone is logged in,
never an email.

```sh
# The last hour, as the API wrote it (-o cat: the message only, without journald's own prefix)
ssh workouterr 'journalctl CONTAINER_NAME=workouterr-api-1 --since "1 hour ago" -o cat'
# Follow new lines as they arrive (Ctrl+C stops)
ssh workouterr 'journalctl CONTAINER_NAME=workouterr-api-1 -f -o cat'
# Errors of the last 7 days, API and app, one compact line each; `fromjson?` skips any line that isn't JSON
ssh workouterr "journalctl CONTAINER_NAME=workouterr-api-1 --since -7d -o cat \
  | jq -cR 'fromjson? | select(.LogLevel == \"Error\" or .LogLevel == \"Critical\")
            | {Timestamp, Category, Message, Exception, UserId: ([.Scopes[]? | .UserId? // empty] | first)}'"
# Caddy and PostgreSQL log to the journal too
ssh workouterr 'journalctl CONTAINER_NAME=workouterr-caddy-1 --since today -o cat'
# How much disk the journal uses
ssh workouterr 'journalctl --disk-usage'
```

`--since` takes `today`, `yesterday`, `"2026-11-23 18:00"` or relative times (`-2h`, `-7d`); `-u` and `-p` filter
by unit and priority. Times print in the server's zone (UTC), the same as the JSON's `Timestamp`.

### Switching a server built before this

Servers built before the logs task use Docker's `local` driver and journald's defaults. A new log driver only
applies to containers created after Docker restarts, so the stack is recreated (a few seconds of downtime; the
`local` logs of the old containers go with them):

```sh
ssh workouterr 'sudo apt-get install -y jq && sudo usermod -aG systemd-journal deploy \
  && echo "{ \"log-driver\": \"journald\" }" | sudo tee /etc/docker/daemon.json \
  && sudo mkdir -p /etc/systemd/journald.conf.d \
  && printf "[Journal]\nStorage=persistent\nMaxRetentionSec=14day\nSystemMaxUse=1G\n" \
     | sudo tee /etc/systemd/journald.conf.d/00-workouterr.conf \
  && sudo systemctl restart systemd-journald docker \
  && cd ~/workouterr && docker compose up -d --force-recreate --wait'
```

The group applies from the next SSH login. Then the two log checks under "Check the server".

## Rebuilding

The server holds no state that the repo or the password manager can't restore, apart from the database itself (see
Backups in `project-scope.md`). To start over: create a new server as above, point the DNS records at it, recreate
`.env`, and deploy.
