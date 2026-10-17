# Deploy spike (ticket 04, task 1)

Throwaway check on the real server before writing `scripts/deploy.sh`. Run it after steps 1–4 of `docs/deploy.md`.
It answers four questions with a tiny app that copies the repo's layout (workspace root, `api/` importing
`shared/` as TypeScript, `public_nodejs/app.js` as an ES module):

1. Does Passenger start an ES module `app.js` that imports `.ts` files (Node 24 type stripping)?
2. Does an import of a workspace package (`node_modules/@spike/shared` → `shared/`) work under Passenger?
3. Can `~/domains/DOMAIN/public_nodejs` be a symlink into a workspace directory, for both Passenger and the
   static files nginx serves?
4. Do variables exported in `~/.bash_profile` reach the app?

## Build the spike app (SSH session on the server)

```sh
SPIKE=~/domains/workouterr.app/app
mkdir -p $SPIKE/shared/src $SPIKE/api/src $SPIKE/api/public_nodejs/public
cd $SPIKE

cat > package.json <<'EOF'
{ "private": true, "type": "module", "workspaces": ["shared", "api"] }
EOF

cat > shared/package.json <<'EOF'
{ "name": "@spike/shared", "type": "module", "exports": { ".": "./src/index.ts" } }
EOF

cat > shared/src/index.ts <<'EOF'
export const greeting: string = 'hello from shared';
EOF

cat > api/package.json <<'EOF'
{ "name": "@spike/api", "type": "module", "dependencies": { "@spike/shared": "*" } }
EOF

cat > api/public_nodejs/app.js <<'EOF'
import '../src/server.ts';
EOF

cat > api/src/server.ts <<'EOF'
import { createServer } from 'node:http';
import { greeting } from '@spike/shared';

const body: string = JSON.stringify({
  node: process.version,
  greeting,
  spikeVariable: process.env.WORKOUTERR_SPIKE ?? 'missing',
  startedAt: new Date().toISOString(),
});
createServer((_request, response) => {
  response.setHeader('content-type', 'application/json');
  response.end(body);
}).listen(3000);
EOF

echo 'static file served by nginx' > api/public_nodejs/public/hello.txt

npm install
ls -l node_modules/@spike   # shared -> ../../shared
```

## Point the site at it

```sh
cd ~/domains/workouterr.app
mv public_nodejs public_nodejs.original
ln -s app/api/public_nodejs public_nodejs
echo 'export WORKOUTERR_SPIKE=from-bash-profile' >> ~/.bash_profile
devil www restart workouterr.app
```

## Checks (from the Mac)

| #   | Command                             | Expected                                                         |
| --- | ----------------------------------- | ---------------------------------------------------------------- |
| 1   | `curl -i https://workouterr.app/hello.txt`  | `200`, `static file served by nginx`                             |
| 2   | `curl -i https://workouterr.app/anything`   | `200` JSON with `node: v24…` and `greeting: hello from shared`   |
| 3   | same as 2                           | `spikeVariable: from-bash-profile`                               |
| 4   | `devil www restart DOMAIN`, then 2  | works on the first request, with a new `startedAt`               |

Use `http://` if HTTPS isn't set up yet. On any failure, read `~/domains/workouterr.app/logs/error.log`.

## If something fails

- **Check 2 fails with an ESM error** (`require() of ES Module`, `Cannot use import statement`): add
  `api/public_nodejs/package.json` with `{ "type": "commonjs" }` and change `app.js` to
  `import('../src/server.ts');` (a CommonJS file loading the ES module), then restart.
- **Checks 1 or 2 fail only with the symlink**: undo it (`rm public_nodejs && mv public_nodejs.original
  public_nodejs`). Copy `app/api/public_nodejs/app.js` into the real `public_nodejs/` and change its import to
  `../app/api/src/server.ts`; put `hello.txt` into the real `public_nodejs/public/`. Then repeat the checks.
- **Check 3 shows `missing`**: try `devil www options` / the panel's WWW settings for environment variables;
  otherwise the app will load a `.env` file itself (task 3).

## Clean up

```sh
cd ~/domains/workouterr.app
rm public_nodejs && mv public_nodejs.original public_nodejs   # only if the symlink is still there
rm -rf app
# remove the WORKOUTERR_SPIKE line from ~/.bash_profile
devil www restart workouterr.app
```

## Results

Fill in after running, then copy the findings into ticket 04's comments.

2026-10-17, server s63, `workouterr.app` (checked with `curl --resolve workouterr.app:443:128.204.223.63` while the
Mac's DNS still cached OVH's parking IP):

- ESM `app.js` + `.ts` imports: works. Node `v24.15.0`, `x-powered-by: Phusion Passenger(R)`
- Workspace package import: works (`greeting: hello from shared`)
- `public_nodejs` as a symlink (Passenger / nginx static): works for both. `hello.txt` comes from nginx
  (no Passenger header), `/anything` from Node
- `~/.bash_profile` variables: reach the app (`spikeVariable: from-bash-profile`)
- HTTPS: Let's Encrypt certificate for `workouterr.app` issued, valid until 2027-01-15
- Cold start after restart: works. After `devil www restart`, the first request answers with a new `startedAt`
- Error log notes: `~/domains/workouterr.app/logs/error.log` empty after all checks and the restart
