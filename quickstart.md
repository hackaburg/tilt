# Quickstart

```sh
# prep
cp backend/.env.example backend/.env
docker run --name backend --network host -v $(pwd):/app -w /app node:alpine yarn

# start everything
docker compose up db phpmyadmin maildev
docker run --name backend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "yarn backend::start"
docker run --name frontend --network host -v $(pwd):/app -w /app node:alpine sh \
  -c "API_BASE_URL='http://localhost:3000/api' yarn frontend::start" \
```

Visit http://localhost:8080/

Edit code, frontend and backend restart automatically.


# Quickstop

```sh
docker rm -f backend frontend
docker compose down
```
