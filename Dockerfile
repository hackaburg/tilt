FROM node:alpine AS build

WORKDIR /app

# bcrypt depends on node-pre-gyp
RUN apk add --no-cache --virtual .gyp python3 make g++

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install

COPY --chown=node:node entrypoint.sh /app
COPY --chown=node:node backend/ /app/backend/
COPY --chown=node:node frontend/ /app/frontend/

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN yarn backend::build && \
    API_BASE_URL=/api yarn frontend::build && \
    mv backend/dist/ tmp && rm -rf backend/ && mv tmp backend && \
    mv frontend/dist/ tmp && rm -rf frontend/ && mv tmp frontend

RUN yarn install --production

FROM node:alpine

WORKDIR /app
USER node:node
COPY --from=build --chown=node:node /app /app
ENV HTTP_PUBLIC_DIRECTORY=/app/frontend
CMD [ "/bin/sh", "/app/entrypoint.sh" ]
