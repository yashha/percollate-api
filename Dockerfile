FROM bitnami/node:14 as builder
ENV NODE_ENV="production"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . /app
WORKDIR /app

RUN npm install -g yarn

RUN node --version \
    && npm --version \ 
    && yarn --version

RUN yarn


FROM bitnami/node:14-prod
ENV NODE_ENV="production"
COPY --from=builder /app /app

RUN install_packages texlive-extra-utils texlive-latex-recommended chromium dumb-init

WORKDIR /app

EXPOSE 3000
CMD ["dumb-init", "yarn", "start"]
