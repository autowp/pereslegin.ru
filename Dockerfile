FROM node:14 as builder

LABEL maintainer "dmitry@pereslegin.ru"

WORKDIR /app

ADD package.json /app/package.json
RUN npm install --silent

ADD . /app

RUN ./node_modules/.bin/webpack -p --display errors-only

FROM nginx:1-alpine

EXPOSE 8080

COPY ./etc/ /etc/

COPY --from=builder /app/dist /usr/share/nginx/html
