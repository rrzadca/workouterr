# syntax=docker/dockerfile:1

# The API image: the published app plus the EF Core migration bundle. Build context: api/.
#   docker compose build api   (from deploy/)

# Build stage on the machine's own platform; `-a` / `--target-runtime` cross-compile for the target one, so an
# arm64 Mac builds an amd64 image without emulating the SDK. The SDK tag is the version in api/global.json: a floating
# `10.0` tag would move to the next feature band (10.0.5xx), which global.json's `latestPatch` refuses.
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0.401 AS build
ARG TARGETARCH
WORKDIR /source

# The build-time OpenAPI document is for contracts/, not for the image; generating it would start the app.
# MSBuild reads environment variables as properties.
ENV OpenApiGenerateDocuments=false

# Restore first, from the project files only: this layer is reused until a package or the SDK pin changes.
COPY global.json Directory.Build.props dotnet-tools.json ./
COPY src/Workouterr.Api/Workouterr.Api.csproj src/Workouterr.Api/
COPY src/Workouterr.Domain/Workouterr.Domain.csproj src/Workouterr.Domain/
RUN dotnet tool restore && dotnet restore src/Workouterr.Api -a $TARGETARCH

COPY src/ src/
RUN dotnet publish src/Workouterr.Api -a $TARGETARCH --no-restore -c Release -o /app

# The migration bundle: one executable that applies the pending migrations, run by the deploy before the new API
# starts. Docker names the architecture amd64, .NET calls it x64.
RUN runtime=linux-$([ "$TARGETARCH" = amd64 ] && echo x64 || echo "$TARGETARCH") \
    && dotnet ef migrations bundle --project src/Workouterr.Api --configuration Release \
       --target-runtime "$runtime" --output /app/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Data Protection keys encrypt the login cookie; compose mounts a volume here so they outlive the container. Created
# now so the volume starts out owned by the app user.
RUN mkdir -p /home/app/.aspnet/DataProtection-Keys && chown -R $APP_UID /home/app/.aspnet

COPY --from=build /app .

# The non-root user the .NET images ship with. Listens on 8080 (ASPNETCORE_HTTP_PORTS), plain HTTP behind Caddy.
USER $APP_UID
ENTRYPOINT ["dotnet", "Workouterr.Api.dll"]
