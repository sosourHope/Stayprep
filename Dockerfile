# StayPrep als Container (z. B. für Railway, Fly.io oder einen eigenen Server).
# Die Daten liegen unter /data – dort ein dauerhaftes Laufwerk (Volume) einhängen.
FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY server ./server
COPY public ./public
COPY scripts ./scripts

ENV NODE_ENV=production \
    PORT=3000 \
    DB_FILE=/data/db.json

RUN mkdir -p /data
VOLUME /data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server/index.js"]
