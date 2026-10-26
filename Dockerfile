FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig*.json vite.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28.2-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/ /srv/portfolio/
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
