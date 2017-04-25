FROM nginx

LABEL maintainer "dmitry@pereslegin.ru"

WORKDIR /app

RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y \
    build-essential curl

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

RUN curl -O http://ftp.de.debian.org/debian/pool/main/libp/libpng/libpng12-0_1.2.50-2+deb8u3_amd64.deb
RUN dpkg -i libpng12-0_1.2.50-2+deb8u3_amd64.deb

ADD . /app

RUN npm install

RUN ./node_modules/.bin/webpack -p

EXPOSE 80
