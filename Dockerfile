FROM buildkite/puppeteer:latest

RUN apt-get install -y texlive-extra-utils
RUN npm install -g pnpm

WORKDIR /app
COPY . .

RUN node --version \
    && npm --version \
    && pnpm --version

RUN pnpm install

EXPOSE 3000
CMD ["pnpm", "start"]
