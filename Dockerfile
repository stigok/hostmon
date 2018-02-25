# Need stretch for iputils-ping 20161105-1 as it has `ping -6` support
FROM node:6.12-stretch

RUN set -x \
  && apt update \
  && apt install -y iputils-ping

WORKDIR /usr/src/app
EXPOSE 3000

# Install required dependencies
COPY package*.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app
CMD node bin/hostmon
