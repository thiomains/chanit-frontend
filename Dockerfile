# --- Base Stage ---
FROM node:20.18.0 AS base

# Verzeichnisstruktur vorbereiten
WORKDIR /app

# Pakete installieren mit stabiler npm Version (optional)
RUN npm install -g npm@10.8.2

# --- Dependencies Stage ---
FROM base AS deps

# package.json und lockfile separat für Caching
COPY package*.json ./

# Workaround für Rollup/Nuxt optionalDependencies Bug
RUN rm -rf node_modules package-lock.json \
 && npm install

# --- Build Stage ---
FROM base AS build

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build

# --- Production Stage ---
FROM node:20.18.0 AS runner

ENV NODE_ENV=production
WORKDIR /app

# Nur notwendige Dateien für Produktion
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Optional: Wenn du serverMiddleware o.ä. nutzt:
# COPY --from=build /app/server ./server

EXPOSE 3000

CMD [ "node", ".output/server/index.mjs" ]