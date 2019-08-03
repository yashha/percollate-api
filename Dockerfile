# Initially from here https://github.com/christopher-talke/node-express-puppeteer-pdf-example
FROM debian:jessie

RUN apt-get update && apt-get install wget -y
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get install google-chrome-stable -y \
    && apt-get dist-upgrade -yq

RUN apt-get install -y texlive-extra-utils

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64.deb
RUN dpkg -i dumb-init_*.deb

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 10.16.1

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

RUN node -v
RUN npm -v

RUN apt-get install git -y
WORKDIR /usr/app
COPY package.json ./
RUN npm install
COPY . ./

RUN npm run build
EXPOSE 3000
CMD ["dumb-init", "npm", "start"]
