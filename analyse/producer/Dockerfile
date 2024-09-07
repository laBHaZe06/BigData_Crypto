FROM node:18.19.0-alpine as development

WORKDIR /var/www/producer

EXPOSE 5010

ENV NODE_ENV=production

RUN npm install cache clean --force

RUN npm install 

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

COPY . .

CMD ["node", "server.js"]