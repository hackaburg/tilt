FROM node:latest

WORKDIR /app/backend
RUN chown -R node:node /app
USER node:node

COPY backend/package.json .
COPY backend/yarn.lock .
RUN yarn install

COPY types /app/types/
COPY backend /app/backend/
RUN yarn build

CMD [ "node", "dist/tilt.js" ]
