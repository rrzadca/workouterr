# Deploying to MyDevil

Production runs on MyDevil shared hosting (FreeBSD): the API as a Node.js site under Phusion Passenger, the Angular
build as static files from the same domain, PostgreSQL on MyDevil. Migrations run from the Mac through an SSH tunnel
(ADR-0001).

Placeholders used below:

| Placeholder | Example              | Where to find it                                     |
| ----------- | -------------------- | ---------------------------------------------------- |
| `LOGIN`     | `radek`              | MyDevil account login                                |
| `X`         | `14`                 | server number, from the server name `sX.mydevil.net` |
| `DOMAIN`    | `workouterr.example` | the app's domain                                     |
| `DATABASE`  | `p1234_workouterr`   | full database name as `devil pgsql list` shows it    |
| `WEB_IP`    | `128.204.218.10`     | DevilWEB panel → SSL → Strony WWW                    |

## One-time server setup

Steps 1–5 run once, in an SSH session (`ssh LOGIN@sX.mydevil.net`) or in the DevilWEB panel.

### 0. SSH key login from the Mac

The deploy script opens several SSH connections, so log in with a key instead of the password. From the Mac:

```sh
ssh-copy-id -i ~/.ssh/id_ed25519.pub LOGIN@sX.mydevil.net    # asks for the password one last time
ssh -o BatchMode=yes LOGIN@sX.mydevil.net 'echo key login works'
```

If the key has a passphrase, store it in the macOS keychain once with `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`.

### 1. Node 24 on the command line

The system default is an older Node. Links in `~/bin` make `node` and `npm` mean 24:

```sh
mkdir -p ~/bin
ln -fs /usr/local/bin/node24 ~/bin/node
ln -fs /usr/local/bin/npm24 ~/bin/npm
```

`~/bin` must come first on `PATH`. A new account has no `~/.bash_profile`, so check before creating one:

```sh
echo $PATH | tr ':' '\n'   # is /home/LOGIN/bin (or /usr/home/LOGIN/bin) listed, before /usr/local/bin?
ls -a ~                    # is there a ~/.profile?
```

If `~/bin` is missing or comes after `/usr/local/bin`, create `~/.bash_profile`. Bash reads only `~/.bash_profile`
once it exists and skips `~/.profile`, so source that file first if it's there:

```sh
cat > ~/.bash_profile <<'EOF'
[ -f ~/.profile ] && . ~/.profile
export PATH="$HOME/bin:$PATH"
EOF
source ~/.bash_profile
```

Then, in a new SSH session:

```sh
which node       # ~/bin/node
node --version   # v24.x
npm --version
```

Passenger also reads `~/.bash_profile` (not `~/.bashrc`), which matters for production configuration below.

### 2. The Node.js site

Panel: WWW → Dodaj stronę → type **Node.js**, version **24**, domain `DOMAIN`. Or over SSH:

```sh
devil www add DOMAIN nodejs /usr/local/bin/node24 production
```

This creates `~/domains/DOMAIN/public_nodejs/`. Passenger starts `public_nodejs/app.js`; nginx serves
`public_nodejs/public/` directly, so only requests that don't match a file there reach Node. Remove the placeholder
page: `rm ~/domains/DOMAIN/public_nodejs/public/index.html`.

Errors from the app go to `~/domains/DOMAIN/logs/error.log`. Don't delete the `logs` directory, because Passenger
sites stop working without it.

### 3. PostgreSQL database

```sh
devil pgsql db add workouterr   # asks for a password; creates a user with the same name as the database
devil pgsql list                # shows the full name (MyDevil may add a prefix): that is DATABASE
```

The database host is `pgsqlX.mydevil.net`, reachable only from MyDevil's servers. From the Mac, use an SSH tunnel:

```sh
ssh -f -N -L 15432:pgsqlX.mydevil.net:5432 LOGIN@sX.mydevil.net
```

Port 15432 keeps the tunnel away from local Docker PostgreSQL on 5432. The Mac has no `psql` of its own; run it
from the Docker image the project already uses (`host.docker.internal` is the Mac, seen from inside the container):

```sh
docker run --rm -it postgres:16-alpine psql -h host.docker.internal -p 15432 -U DATABASE DATABASE
```

Or install the client once with `brew install libpq` and use the `psql -h localhost -p 15432 …` form; Homebrew
doesn't link it, so add `/opt/homebrew/opt/libpq/bin` to `PATH`.

Close the tunnel when done: `pkill -f 'ssh -f -N -L 15432'`.

### 4. HTTPS

The domain's DNS stays at the registrar (OVH for `workouterr.app`). In its DNS zone, set the A record of the bare
domain to `WEB_IP` and delete any other A or AAAA records for it (OVH's parking page uses `213.186.33.5`). `WEB_IP`
is the site's web address, not the SSH server's own IP. Wait until public DNS shows the change (up to the old record's
TTL, one hour at OVH):

```sh
dig +short @1.1.1.1 DOMAIN A   # must print WEB_IP only
host DOMAIN                    # on the server: MyDevil checks with its own resolver, which may still cache the old IP
```

Then ask for the certificate. Without the correct A record it fails with `Rekord A domeny jest nieprawidłowy`:

```sh
devil ssl www add WEB_IP le le DOMAIN
```

`.app` domains are on the browsers' HSTS preload list, so browsers only open them over HTTPS. Until the certificate
exists, test with `curl http://DOMAIN/…`.

### 5. Native modules (only when a dependency needs it)

argon2 (ticket 05) compiles native code. Packages with binaries need binexec enabled, then log out and back in:

```sh
devil binexec on
```

If compiling fails, set `export CC=clang CXX=clang++` (or `gcc` / `g++`) before `npm ci`.

## Production configuration

The app reads environment variables (`api/src/config.ts`) and refuses to start when one is missing or invalid. On
the server they live in `~/.bash_profile`, which Passenger reads when it starts the app (the deploy spike confirmed
this). They are never in git, and the deploy never touches the file.

| Variable       | Production value                                                     |
| -------------- | -------------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://DATABASE:PASSWORD@pgsqlX.mydevil.net:5432/DATABASE`    |
| `PORT`         | not set: Passenger gives the app its own socket and ignores the port |

`NODE_ENV` is not set by hand either. Passenger runs the site in its `production` environment (step 2; the process
title shows `(production)`) and should pass that on as `NODE_ENV`, but this is not confirmed on MyDevil. The app does
not read `NODE_ENV` today; check it before relying on it.

### Setting it up

The password goes into a URL, so characters like `@`, `:`, `/` or `#` would break it. Give the database a
password made of letters and digits only (this replaces the one chosen in step 3):

```sh
openssl rand -hex 24                   # copy the output
devil pgsql passwd DATABASE            # paste it as the new password
```

Add the variable, with single quotes so the shell takes the value literally, and keep the file private, since it
now holds a password:

```sh
cat >> ~/.bash_profile <<'EOF'
export DATABASE_URL='postgresql://DATABASE:PASSWORD@pgsqlX.mydevil.net:5432/DATABASE'
EOF
chmod 600 ~/.bash_profile
source ~/.bash_profile
psql "$DATABASE_URL" -c 'select 1'     # the connection works from the server
```

### Changing a value

Edit `~/.bash_profile`, then `devil www restart DOMAIN`. A running app keeps the values it started with.

Cron jobs (ticket 14) don't read `~/.bash_profile`; their scripts must load it themselves.

## Deploying

### Running a deploy

Once, on the Mac: `cp .env.deploy.example .env.deploy` and fill in the SSH target and domain. The file holds no
password; the script reads `DATABASE_URL` from `~/.bash_profile` on the server.

Then, with Docker PostgreSQL running (the tests need it) and everything committed:

```sh
nvm use
scripts/deploy.sh
```

The steps run in this order, and the first failure stops the deploy:

| Step                | What happens                                                                  |
| ------------------- | ----------------------------------------------------------------------------- |
| Settings            | reads `.env.deploy`; refuses Node other than 24 and uncommitted changes       |
| Checks              | `npm run lint`, `npm run typecheck`, `npm test`                               |
| Tunnel              | SSH tunnel `localhost:15432` → the production database                        |
| Migrate             | `prisma migrate deploy` through the tunnel (ADR-0001), then the tunnel closes |
| Build               | generates the Prisma client, builds the Angular app from a clean `web/dist`   |
| Upload              | assembles the server tree (below) and mirrors it with `rsync --delete`        |
| Install and restart | `npm ci` (see below) and `devil www restart` over SSH                         |
| Smoke check         | `GET /api/health` is ok with this version; `/` is the Angular app             |

The first deploy also replaces MyDevil's default `public_nodejs/` with the link into `app/`, keeping the original as
`public_nodejs.original`.

Migrations run before the new code is uploaded, so if a later step fails, the old code runs on the new schema until
the next deploy. That is why migrations must stay backward compatible (ADR-0001). During the upload and `npm ci`,
the running app can briefly fail requests.

### What the server gets

The server holds the npm workspace, minus the parts it doesn't run, in `~/domains/DOMAIN/app/`:

```
~/domains/DOMAIN/
├── app/                      root package.json + package-lock.json, api/, shared/
│   └── api/
│       ├── public_nodejs/
│       │   ├── app.js        Passenger's entry point
│       │   ├── index.html    Angular's page, served by the app with no-cache
│       │   └── public/       the rest of the Angular build, served by nginx
│       └── src/generated/    Prisma client, generated on the Mac
├── public_nodejs -> app/api/public_nodejs
└── logs/
```

`api/` imports `shared/` as TypeScript through the workspace link `node_modules/@workouterr/shared`, so `shared/`
must sit next to `api/` with the root `package.json`; copying `api/` alone breaks the import.

### Dependencies on the server

```sh
npm ci --omit=dev --omit=optional --workspace=api --ignore-scripts
```

- `--workspace=api`: only the API's dependencies (and the `shared` link), not Angular's. `web/` and `ui/` aren't on
  the server, and `npm ci` doesn't need them.
- `--omit=dev`: no TypeScript, ESLint or test tools.
- `--omit=optional`: `@prisma/client` lists the Prisma CLI as an optional peer, which `--omit=dev` alone still
  installs (with its engines: 336 MB instead of 87 MB). The server never runs the CLI (ADR-0001).
- `--ignore-scripts`: skips `api`'s `postinstall`, whose `prisma generate` needs the CLI. It is the only install
  script among the production packages today.

The Prisma client in `api/src/generated/` is therefore generated on the Mac (`npm run db:generate -w api`) and
uploaded with the code. It is plain TypeScript plus Prisma's WebAssembly query compiler, with nothing built for the
Mac's platform, so the same files run on FreeBSD. Generating it in every deploy keeps it in step with the migrations
that deploy applies.

A native dependency (argon2, ticket 05) needs its install script, so it is rebuilt by name after `npm ci`
(`npm rebuild argon2`), which runs only that package's script.

## Operations

| Task               | Command                                   |
| ------------------ | ----------------------------------------- |
| Restart the app    | `devil www restart DOMAIN`                |
| Read the error log | `tail -f ~/domains/DOMAIN/logs/error.log` |
| Open a DB tunnel   | see step 3                                |

Passenger stops the app after 24 hours without requests and starts it again on the next request. Background work
therefore runs as cron jobs (ticket 14), not inside the app.
