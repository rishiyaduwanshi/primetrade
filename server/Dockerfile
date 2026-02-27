FROM node:22-alpine

RUN apk upgrade --no-cache

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

EXPOSE 5050

CMD ["node", "server.js"]
