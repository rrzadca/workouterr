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
| App folder   | `/home/deploy/workouterr` (`compose.yaml`, `.env`)                        |

**Why so small:** nothing is built on the server; the images are built on the Mac and only loaded and run here.
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
5. On the server: `docker compose run --rm --no-build migrations`, then `docker compose up -d --wait --no-build`, then
   `docker image prune -f` (the replaced images, now untagged). `--no-build` because the server has no source; the
   `build:` sections in `compose.yaml` are ignored.
6. `curl https://<domain>/api/health`, with the domain read from the server's `.env`.

The first deploy is also when Caddy gets its Let's Encrypt certificate (DNS must resolve, section 3).

## 8. First user

The API's CLI runs in a one-off `api` container; `-t` gives it a terminal, so the password is asked for with hidden
input:

```sh
ssh -t workouterr 'cd ~/workouterr && docker compose run --rm --no-build api user create <email>'
```

## 9. Uptime check

A free external monitor (UptimeRobot) requests `https://workouterr.app/api/health` every 5 minutes and emails when it
fails: a non-200 means the API or the database is down, a timeout means the server or Caddy is. Monitor type HTTP(s),
alert contact the owner's email. The endpoint returns only `{"status":"Healthy"}`, so nothing personal leaves the
server.

## Rebuilding

The server holds no state that the repo or the password manager can't restore, apart from the database itself (see
Backups in `project-scope.md`). To start over: create a new server as above, point the DNS records at it, recreate
`.env`, and deploy.
