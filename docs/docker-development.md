# Docker Development

## Start

```sh
# prep
cp backend/.env.example backend/.env
docker run -v $(pwd):/app -w /app node:alpine npm install

# start everything (make sure your cwd is the project root)
docker compose up db phpmyadmin maildev
docker run --name backend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "npm run backend::start"
docker run --name frontend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "API_BASE_URL='http://localhost:3000/api' npm run frontend::start"
```

1. Visit tilt http://localhost:8080/
2. register yourself
3. open email in maildev http://localhost:8082/
4. copy verification link, replace port with tilt port (8080)
5. open edited link in browser. Ignore "invalid token" error

```sh
# Make yourself admin
docker exec backend npm run backend::usermod test@test.test root
```

Edit code, frontend and backend restart automatically.

## Tests

```sh
docker exec backend npm run backend::test
```

## Lint

```sh
docker exec backend npm audit --production
docker exec backend node ./node_modules/.bin/prettier --config .prettierrc.js '{backend,frontend}/{src,test}/**/*.{ts,tsx}' --write
docker exec backend npm run lint
docker exec frontend npm run frontend::typecheck
```

## Stop

```sh
docker rm -f backend
docker rm -f frontend
docker compose down
```
