apt-get update
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs build-essential curl

curl -O http://ftp.de.debian.org/debian/pool/main/libp/libpng/libpng12-0_1.2.50-2+deb8u3_amd64.deb
dpkg -i libpng12-0_1.2.50-2+deb8u3_amd64.deb

npm install
./node_modules/.bin/webpack -p
