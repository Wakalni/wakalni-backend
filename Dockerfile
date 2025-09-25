FROM node:20-alpine

RUN corepack enable

WORKDIR /usr/src/app

RUN apk add --no-cache curl

COPY package*.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN rm -rf src/

EXPOSE 8000

CMD ["yarn", "start:prod"]