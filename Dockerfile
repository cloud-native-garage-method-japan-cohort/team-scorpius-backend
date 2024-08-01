# FROM node:12
FROM node:20.15.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 8000

CMD [ "npm", "start" ]