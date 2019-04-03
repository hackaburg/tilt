FROM node:alpine

COPY . /app
WORKDIR /app

RUN yarn install \
    && yarn build \
    && chown 1000:1000 /app

USER 1000:1000
CMD [ "node", "dist/tilt.js" ]
