FROM node:alpine AS build

WORKDIR /app/frontend
COPY frontend/package.json .
COPY frontend/yarn.lock .
RUN yarn install

COPY types /app/types
COPY frontend /app/frontend
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
