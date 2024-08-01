# FROM node:12
FROM node:20.15.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN mkdir /.npm && chown -R 1000780001:1000780001 /.npm && npm ci
USER 1000780001

# RUN npm install
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]