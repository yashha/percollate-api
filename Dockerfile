FROM ghcr.io/puppeteer/puppeteer:latest

USER root

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
	&& apt-get install -y --no-install-recommends chromium texlive-extra-utils \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
