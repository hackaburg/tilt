FROM node:alpine AS build

COPY . /app
WORKDIR /app
RUN yarn install && yarn build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
