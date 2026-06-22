FROM node:18
WORKDIR /app

# Install pnpm
RUN npm i -g pnpm

# Copy package files first to leverage caching
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

EXPOSE 4001
CMD ["node", "server/embedded-signup-server.js"]
