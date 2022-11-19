FROM node:16 as BUILD_IMAGE

WORKDIR /usr/app

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

FROM node:16-slim

WORKDIR /usr/app
COPY ./package.json .
COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules

COPY app.js .
COPY create_id.js .
COPY utils.js .

ARG SECRET

RUN node create_id.js

ENTRYPOINT npm start