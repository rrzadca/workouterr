# syntax=docker/dockerfile:1

# The Caddy image: the built Angular app and the Caddyfile. Build context: web/.
#   GITHUB_PACKAGES_TOKEN=… docker compose build caddy   (from deploy/)

# The output is static files, so the build runs on the machine's own platform whatever the target.
FROM --platform=$BUILDPLATFORM node:24-slim AS build
WORKDIR /source

# Install first, from the manifests only: this layer is reused until a dependency changes.
COPY package.json package-lock.json .npmrc ./
# The token reaches only this command, as an environment variable from a BuildKit secret: it is never a build
# argument and never written to a layer. .npmrc reads it as ${GITHUB_PACKAGES_TOKEN}.
RUN --mount=type=secret,id=github_packages_token,env=GITHUB_PACKAGES_TOKEN,required=true \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM caddy:2
COPY --from=build /source/dist/workouterr/browser /srv
COPY --from=deploy Caddyfile /etc/caddy/Caddyfile
