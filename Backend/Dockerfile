FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

# Use ts-node in dev mode — no build step required, fast startup
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/main.ts"]
