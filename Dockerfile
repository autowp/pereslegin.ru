FROM node:14 as builder

LABEL maintainer = "dmitry@pereslegin.ru"

HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:8081/health || exit 1

WORKDIR /app

ADD package.json /app/package.json
RUN npm install --silent

ADD . /app

RUN ./node_modules/.bin/webpack -p --display errors-only

FROM nginxinc/nginx-unprivileged:1-alpine

EXPOSE 8080

COPY --chown=101:101 ./etc/nginx/ /etc/nginx/

COPY --chown=101:101 --from=builder /app/dist /usr/share/nginx/html
