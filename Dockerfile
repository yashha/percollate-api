FROM ghcr.io/puppeteer/puppeteer:latest

USER root

RUN apt-get update && apt-get install -y texlive-extra-utils

RUN npm install -g pnpm

WORKDIR /app
COPY . .

RUN node --version \
    && npm --version \
    && pnpm --version

RUN pnpm install

EXPOSE 3000
CMD ["pnpm", "start"]
