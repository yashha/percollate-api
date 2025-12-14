FROM node:18

RUN apt-get update && apt-get install wget -y
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get install google-chrome-stable -y \
    && apt-get dist-upgrade -yq

RUN apt-get install -y texlive-extra-utils chromium

COPY . /app
WORKDIR /app

RUN npm install -g pnpm

RUN node node_modules/puppeteer/install.js

RUN node --version \
    && npm --version \
    && pnpm --version

RUN pnpm install

EXPOSE 3000
CMD ["pnpm", "start"]
