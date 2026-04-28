# Build stage — install ALL deps (including devDeps) and compile TypeScript
FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage — only runtime dependencies + compiled output
FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled NestJS app from build stage
COPY --from=build /usr/src/app/dist ./dist

# public/ is mounted via docker-compose volumes, but copy as fallback
COPY public ./public

EXPOSE 3000

# Run the compiled JavaScript — no ts-node needed
CMD ["node", "dist/main.js"]
