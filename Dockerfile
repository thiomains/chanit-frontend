# --- Dependencies Stage ---
FROM node:22.18.0 AS deps
WORKDIR /app

# package.json und lockfile separat für Caching
COPY package*.json ./

# Workaround für Rollup/Nuxt optionalDependencies Bug
RUN rm -rf node_modules package-lock.json \
 && npm install

# --- Build Stage ---
FROM node:22.18.0 AS build
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=2048"

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