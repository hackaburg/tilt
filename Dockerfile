FROM node:latest

WORKDIR /app
RUN chown -R node:node /app
USER node:node

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install

ADD --chown=node:node frontend/ /app/frontend/
ADD --chown=node:node backend/ /app/backend/
ADD --chown=node:node entrypoint.sh /app

RUN yarn backend::build && \
    API_BASE_URL=/api yarn frontend::build && \
    yarn install --production && \
    mv backend/dist/ tmp && rm -rf backend/ && mv tmp backend && \
    mv frontend/dist/ tmp && rm -rf frontend/ && mv tmp frontend

ENV HTTP_PUBLIC_DIRECTORY=/app/frontend

CMD [ "/bin/bash", "/app/entrypoint.sh" ]
