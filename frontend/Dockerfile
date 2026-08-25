FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_API_URL=https://constellationshop.ru/api
ARG NEXT_PUBLIC_MEDIA_URL=https://constellationshop.ru/minio
ARG NEXT_PUBLIC_MEDIA_BUCKET_URL=https://constellationshop.ru/minio/images-bucket
ARG NEXT_PUBLIC_VKID_APP_ID=54614063
ARG NEXT_PUBLIC_VKID_REDIRECT_URL=https://constellationshop.ru
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL
ENV NEXT_PUBLIC_MEDIA_BUCKET_URL=$NEXT_PUBLIC_MEDIA_BUCKET_URL
ENV NEXT_PUBLIC_VKID_APP_ID=$NEXT_PUBLIC_VKID_APP_ID
ENV NEXT_PUBLIC_VKID_REDIRECT_URL=$NEXT_PUBLIC_VKID_REDIRECT_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "run", "start"]
