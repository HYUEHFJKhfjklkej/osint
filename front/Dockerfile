FROM node:20-alpine AS deps
WORKDIR /app
ENV NPM_CONFIG_LOGLEVEL=info \
    NPM_CONFIG_PROGRESS=true
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 1000 \
 && npm config set fetch-timeout 120000 \
 && npm config set audit false
RUN --mount=type=cache,target=/root/.npm npm install --legacy-peer-deps --progress=true --prefer-offline

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
