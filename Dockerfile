FROM node:20-alpine

RUN corepack enable

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

RUN yarn install --production --frozen-lockfile

EXPOSE 8000

CMD ["yarn", "start:prod"]