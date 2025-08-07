# Etapa de build
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de produção
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

# ✅ Adiciona dependências do sistema e ffmpeg
RUN apk add --no-cache ffmpeg

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]