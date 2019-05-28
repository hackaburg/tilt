FROM node:latest

USER node:node
COPY . /app
WORKDIR /app

RUN yarn install \
    && yarn build \
    && chown node:node /app

CMD [ "node", "dist/tilt.js" ]
