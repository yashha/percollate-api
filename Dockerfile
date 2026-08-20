FROM ghcr.io/puppeteer/puppeteer:latest

USER root

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update && apt-get install -y texlive-extra-utils && npm install -g pnpm

WORKDIR /app
COPY . .

RUN node --version \
    && npm --version \
    && pnpm --version

RUN pnpm install --frozen-lockfile

EXPOSE 3000
CMD ["pnpm", "start"]
