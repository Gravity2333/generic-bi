FROM node:16.13.0-alpine3.11

ENV NODE_OPTIONS=--max_old_space_size=2048
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN \
apk add --no-cache build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev python2 bash \
&& apk add --update libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig

RUN \
npm config set registry https://registry.npmmirror.com \
&& npm config set disturl https://npmmirror.com/dist \
&& npm i -g add node-gyp node-prune \
&& mkdir -p /build/packages/bi-common/ \
&& mkdir -p /build/packages/bi-manager/dist/ \
&& mkdir -p /build/packages/bi-manager-prod/ \
&& mkdir -p /build/packages/bi-manager-web/dist/

WORKDIR /build

COPY packages/bi-manager-web/package.json ./packages/bi-manager-web/
COPY packages/bi-manager/package.json packages/bi-manager/tsconfig.json /build/packages/bi-manager/
COPY packages/bi-common/package.json /build/packages/bi-common/
COPY depends.py /build/

RUN python depends.py /build/packages/bi-common/package.json /build/packages/bi-manager-web/package.json /build/packages/bi-manager/package.json && npm install

ENV NODE_PATH /usr/local/lib/node_modules:/build/node_modules

