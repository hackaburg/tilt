# Quickstart

For development

```sh
# prep
cp backend/.env.example backend/.env
docker run -v $(pwd):/app -w /app node:alpine yarn install

# start everything (make sure your cwd is the project root)
docker compose up db phpmyadmin maildev
docker run --name backend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "yarn backend::start"
docker run --name frontend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "API_BASE_URL='http://localhost:3000/api' yarn frontend::start"
```

1. Visit tilt http://localhost:8080/
2. register yourself
3. open email in maildev http://localhost:8082/
4. copy verification link, replace port with tilt port (8080)
5. open edited link in browser. Ignore "invalid token" error

```sh
# Make yourself admin
docker exec backend yarn run backend::usermod test@test.test root
```

Edit code, frontend and backend restart automatically.

# Quickstop

```sh
docker rm -f backend
docker rm -f frontend
docker compose down
```
