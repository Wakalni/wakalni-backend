FROM node:20-alpine

RUN corepack enable

WORKDIR /usr/src/app

RUN apk add --no-cache curl

COPY package*.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 8000

RUN rm -rf src/

CMD ["yarn", "start:prod"]