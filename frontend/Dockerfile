# Based on https://pnpm.io/docker
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@12.8.1 --activate
WORKDIR /app
COPY ./tenkey-raffle-frontend .

# Build app
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# ENV GODEBUG=cpu.bmi2=off
# ENV VITE_BACKEND_ADDRESS=http://tenkey-raffle-v2-backend:6001
ENV VITE_BACKEND_ADDRESS=http://localhost:6001
RUN pnpm build

# Combine and run
FROM nginx:alpine AS run
WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./custom-nginx-default.conf /etc/nginx/conf.d/default.conf
ENV NODE_ENV=production
# CMD ["node", "dist/index.js"] # Not needed since nginx runs