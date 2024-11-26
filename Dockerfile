FROM node:16.13.0-alpine3.11 as generic-bi-x86

ENV NODE_OPTIONS=--max_old_space_size=2048
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 
RUN sed -i 's#https\?://dl-cdn.alpinelinux.org/alpine#https://mirrors.tuna.tsinghua.edu.cn/alpine#g' /etc/apk/repositories

RUN \
  # npm install -g nrm \
  # && nrm use taobao \
  npm install -g cnpm --registry=https://registry.npmmirror.com \
  && mkdir -p /build/packages/bi-common/ \
  && mkdir -p /build/packages/bi-manager/dist/ \
  && mkdir -p /build/packages/bi-manager-prod/ \
  && mkdir -p /build/packages/bi-manager-web/dist/ \
  && npm config set registry https://registry.npmmirror.com \
  && npm config set disturl https://npmmirror.com/dist \
  && npm install -g node-prune \
  && npm i -g add node-gyp \
  # node-canvas
  # @see: https://github.com/Automattic/node-canvas/issues/1886#issuecomment-925928476
  && apk add --no-cache build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev python2 bash \
  && apk add --update libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig

WORKDIR /build

# Copy your packages
COPY packages/bi-manager-web/package.json ./packages/bi-manager-web/
COPY packages/bi-manager/package.json packages/bi-manager/tsconfig.json /build/packages/bi-manager/
COPY packages/bi-common/package.json /build/packages/bi-common/

# 构建 common
RUN cd /build/packages/bi-common/ && npm install numeral sqlstring uuid -g && npm install
COPY packages/bi-common ./packages/bi-common/
RUN cd /build/packages/bi-common/ && npm run build

# 构建 manager-web 
RUN cd /build/packages/bi-manager-web/ && npm install /build/packages/bi-common && npm install 
COPY packages/bi-manager-web ./packages/bi-manager-web/
RUN cd /build/packages/bi-manager-web/ && npm run build --timeout=100000 || true

# 构建 manager
RUN cd /build/packages/bi-manager/ && npm install /build/packages/bi-common && npm install
COPY packages/bi-manager ./packages/bi-manager/
RUN cd /build/packages/bi-manager/ && npm run build

# 处理 bi-manager 的生产环境依赖
COPY packages/bi-manager/package.json /build/bi-manager-prod/

WORKDIR /build/bi-manager-prod
RUN cnpm install /build/packages/bi-common && cnpm install numeral sqlstring uuid && cnpm install --production && node-prune

# ===================
FROM alpine:latest
ENV TIME_ZONE=Asia/Shanghai
ENV NODE_ENV production
ENV PLATFORM X86
ENV BI_VERSION NPMD

# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
RUN \
  mkdir -p /usr/src/app \
  && mkdir -p /usr/src/app/view \
  && mkdir -p /usr/src/app/dist \
  && mkdir -p /usr/src/app/node_modules \
  && mkdir -p /usr/src/app/dist/resources/pdf \
  && mkdir -p /usr/src/app/dist/resources/backgrounds \
  && cd /usr/src/app/dist/resources/ \
  && chmod 777 ./pdf \
  && chmod 777 ./backgrounds \
  && mkdir -p -m 777 /usr/src/app/dist/init/dashboard \
  && mkdir -p -m 777 /usr/src/app/dist/init/widget \
  && mkdir -p -m 777 /usr/src/app/dist/init/sql \
  && cd /usr/src/app/dist/init/ \
  && chmod 777 ./dashboard \
  && chmod 777 ./widget \
  && chmod 777 ./sql \
  && sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  && echo "https://mirrors.aliyun.com/alpine/edge/community/" >> /etc/apk/repositories \
  && apk -U --no-cache update && apk add --no-cache --allow-untrusted nodejs yarn tzdata bash chromium nss ca-certificates font-wqy-zenhei \
  && rm -rf /var/cache/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app
# 拷贝 nodejs 服务
COPY --from=generic-bi-x86 /build/packages/bi-manager/package.json /build/packages/bi-manager/tsconfig.json /usr/src/app/
COPY --from=generic-bi-x86 /build/packages/bi-manager/dist/ /usr/src/app/dist/
COPY --from=generic-bi-x86 /build/bi-manager-prod/node_modules/ /usr/src/app/node_modules/

# Copy Web production
COPY --from=generic-bi-x86 /build/packages/bi-manager-web/dist/index.html /usr/src/app/view/
COPY --from=generic-bi-x86 /build/packages/bi-manager-web/dist/favicon.ico /usr/src/app/view/
COPY --from=generic-bi-x86 /build/packages/bi-manager-web/dist/config /usr/src/app/view/
COPY --from=generic-bi-x86 /build/packages/bi-manager-web/dist/ /usr/src/app/dist/app/public/

# 拷贝初始化仪表盘文件
COPY --from=generic-bi-x86 /build/packages/bi-manager/dist/app/init/dashboard/* /usr/src/app/dist/init/dashboard/
COPY --from=generic-bi-x86 /build/packages/bi-manager/dist/app/init/widget/* /usr/src/app/dist/init/widget/
COPY --from=generic-bi-x86 /build/packages/bi-manager/dist/app/init/sql/init_data.sql /usr/src/app/dist/init/sql/

RUN \
  mkdir -p /usr/src/app/dist/app/public/static/resources \
  && cd /usr/src/app/dist/app/public/static/resources \
  && mkdir -p /usr/src/app/dist/app/public/static/resources/backgrounds

EXPOSE 41130

CMD yarn run start:docker

