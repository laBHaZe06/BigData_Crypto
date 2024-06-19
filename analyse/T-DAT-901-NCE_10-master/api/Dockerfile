FROM node:18.19.0-alpine as development

WORKDIR /api

EXPOSE 5000

ENV NODE_ENV=production

RUN npm install cache clean --force

RUN npm install 

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

COPY . .

CMD ["npm", "start"]