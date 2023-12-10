# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm i -g pnpm
RUN pnpm i

COPY . .
RUN npm build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i -g pnpm

COPY --from=build /app .

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s \ 
    CMD node healthcheck.js

EXPOSE 4000

CMD ["node", "dist/index.js"]
