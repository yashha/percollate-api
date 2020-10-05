# Initially from here https://github.com/christopher-talke/node-express-puppeteer-pdf-example
FROM debian:buster-slim

RUN apt-get update && apt-get install wget gnupg2 -y
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get install google-chrome-stable -y \
    && apt-get dist-upgrade -yq

RUN apt-get install -y texlive-extra-utils dumb-init

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 13.7.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

COPY . /app
WORKDIR /app

RUN npm install -g yarn

RUN node --version \
    && npm --version \ 
    && yarn --version

RUN yarn

EXPOSE 3000
CMD ["dumb-init", "yarn", "start"]
