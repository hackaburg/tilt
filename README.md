# tilt

[![CircleCI](https://circleci.com/gh/hackaburg/tilt.svg?style=shield)](https://circleci.com/gh/hackaburg/tilt)
[![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/hackaburg/tilt)](https://hub.docker.com/r/hackaburg/tilt)
[![Docker Image Size (latest)](https://img.shields.io/docker/image-size/hackaburg/tilt/latest)](https://hub.docker.com/r/hackaburg/tilt)
[![codecov](https://codecov.io/gh/hackaburg/tilt/branch/main/graph/badge.svg)](https://codecov.io/gh/hackaburg/tilt)
[![David](https://img.shields.io/david/hackaburg/tilt)](https://github.com/hackaburg/tilt)
[![GitHub license](https://img.shields.io/github/license/hackaburg/tilt.svg)](https://github.com/hackaburg/tilt/LICENSE)

Yet another hackathon registration system.

## Motivation

Like many other hackathons, we previously used [Quill](https://github.com/techx/quill) for our application process, which worked really well for us in the past. Especially Quill's process was a blessing: an application consists of two steps, the profile creation and, once an attendee was admitted to the event, the spot confirmation. We attended different events that used different processes and found this to be easy for both the attendees and organizers.

Faced with maintaining our [fork](https://github.com/hackaburg/quill) with our set of changes to the application process, as well as maintaining an Angular.JS and an untyped Express backend, we wanted to build ourselves a registration system that matched our needs on a tech stack we're more familiar with.

## How does tilt work?

Similar to Quill, tilt's application process consists of the profile creation and a confirmation form. tilt, among other differences, employs a role-based model:

- An attendee is a `user` who can fill out the forms
- A `moderator` can see applications, statistics and admit users
- `root` can modify tilt's settings

`root` can do whatever a `moderator` can do, and a `moderator` can do whatever a `user` can do. This means each user group needs to register through the same form first and you can adjust a user's group later. During registration, tilt queries [haveibeenpwned](https://haveibeenpwned.com) to check for password breaches.

After the setup, `root` can configure tilt's appearance, as well as the application process:

- When should the profile form be made available?
- Until when can users submit their profile form?
- How long can users confirm their spots?

The former two points are represented as dates, whereas the latter is represented in hours. When a user is admitted, they'll have `n` hours to confirm their spot. After this deadline passed, their application will show up as "expired".

Each application consists of two forms, which `root` can configure. Questions have a title, a Markdown description and a type. tilt currently supports text, number, choices and country questions, which each have different configuration options. Each question can however have a parent question, which allows you to build complex, tree-like questionnaires dynamically.

Admitting users is done through the admission page, which consists of a table and a search bar. You can search for any info an attendee might've provided and also filter for special flags such as `is:admitted` or `is:expired`.

To admit someone, check the box on the left for as many people as you want and hit "admit". tilt will send them an email, which `root` can configure as well. The top-most checkbox depends on the visible checkboxes below. Clicking it will either select or deselect all visible rows, leaving your not shown selection intact.

When you add a question to the profile form because you need to ask, e.g., for new terms and conditions and a user already filled out this form, there's almost no chance they'd open up their application and answer this question without you explicitly telling them to.

Disregarding which type of question you want to add, users need to confirm their spot using the second form anyways. tilt adds all new profile questions a user cannot have seen initially to the confirmation form. This way, users need to answer these questions at last during the confirmation step and if they don't agree with, e.g., newly added terms, their spot will expire.

## Usage

tilt was built to be deploy-once-and-forget. For this reason, we provide a Docker image `hackaburg/tilt`. While you could run tilt natively, we highly recommend a containerized setup, as you can update it more easily.

At Hackaburg, we run our server setup through a central NGINX proxy facing the internet and routing requests to individual containers. Given you might want to access tilt through an url like `https://your-hackathon.com/apply`, we'll show both the NGINX setup, as well as a Docker Compose configuration supporting such a setup.

### Docker Compose

tilt uses environment variables for configuration. There are three sections you need to configure:

1. General settings: things like tilt's port, the URL tilt is made available on, as well as the [JWT](https://jwt.io) secret. The latter should be a randomly generated string, as this is used to authenticate users against tilt's API and an easily guessed secret might allow impersonating `root` and `moderator` accounts

2. Mail settings: internally, tilt uses [nodemailer](https://nodemailer.com/) to send out emails. Therefore, configure an SMTP server and supply its TLS/SSL port, e.g., 465

3. Database settings: tilt needs to store data somewhere. Internally, we use TypeORM, which is database-agnostic, but we chose to use the [MySQL](https://www.mysql.com) / [MariaDB](https://mariadb.org) driver. While you could use some other database, these two are supported by default. Furthermore, you could use tools like [phpMyAdmin](https://www.phpmyadmin.net) to manage your database, but we don't recommend this in production. Please refer to the official documentation for whichever database you deploy

```yaml
version: "3"

services:
  # the internet-facing proxy
  proxy:
    image: nginx/alpine
    restart: always
    ports:
      - 80:80
    volumes:
      # we'll configure nginx later. since you're probably
      # already configuring a proxy yourself, we'll just show
      # an example `server` block
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

  # tilt's persistence layer requires a mysql-like database
  # we'll use mariadb here, but you can also use mysql
  tilt_mariadb:
    image: mariadb:latest
    restart: always
    volumes:
      - ./tilt/mariadb:/var/lib/mysql
    environment:
      # tilt doesn't need root privileges on the database,
      # therefore a regular user account and a random root
      # password is the better choice
      - MYSQL_RANDOM_ROOT_PASSWORD=yes
      # these two don't need to be called "tilt", but this is
      # a tilt example
      - MYSQL_DATABASE=tilt
      - MYSQL_USER=tilt
      # genereate a password, as this one is shown publicly
      # in this repository
      - MYSQL_PASSWORD=this_is_not_secure_generate_something

  tilt:
    image: hackaburg/tilt
    restart: always
    environment:
      # the url under which you can reach tilt
      - BASE_URL=https://your-hackathon.com/apply/
      # tilt's http port, which we need in nginx later. as
      # tilt runs in a user account, it can't bind to port
      # 80, therefore, you will still need some kind of
      # proxy to expose tilt on port 80
      - PORT=3000
      - LOG_LEVEL=info
      # generate a secure password for jwt tokens
      - SECRET_JWT=this_is_not_secure_generate_a_password
      # an smtp server
      - MAIL_HOST=your-smtp.server
      # tilt requires tls/ssl for mailing
      - MAIL_PORT=465
      # your smtp username
      - MAIL_USERNAME=your-email@domain.tld
      # the smtp username's password
      - MAIL_PASSWORD=password
      # this section is similar to the mariadb configuration
      # above. simply place username, database and password
      # settings from above here
      - DATABASE_NAME=tilt
      - DATABASE_HOST=tilt_mariadb
      - DATABASE_USERNAME=tilt
      - DATABASE_PASSWORD=this_is_not_secure_generate_something
      - DATABASE_PORT=3306

  # to keep your containers up-to-date, we recommend using
  # a service like watchtower, which continuously pulls for
  # updates. see https://github.com/containrrr/watchtower for
  # more information
  watchtower:
    image: containrrr/watchtower
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

### NGINX

With the environment configuration in place, we can configure NGINX to forward requests to tilt. This step is optional and you can technically expose tilt to the internet through the `PORT` environment variable. If you, like us, want to expose tilt through a subfolder URL, you can use a configuration similar to this:

```nginx
server {
  # the domain this server should listen to
  server_name your-hackathon.com;
  # the port we expose in the docker compose configuration above
  listen 80;

  # we expect the entirety of the uri after the slash at tilt
  # therefore we redirect /apply requests to /apply/
  location = /apply {
    return 301 /apply/;
  }

  # the actual forwarding block passing the requests to tilt
  # watch the trailing slashes, or you might run into issues
  location /apply/ {
    # this forwards requests to the tilt container on port 3000,
    # which we configured previously
    proxy_pass http://tilt:3000/;
  }
}
```

### Starting up

Since database takes a brief moment for its setup, start with:

```bash
$ docker-compose up tilt_mariadb
```

Then wait for MariaDB to accept incoming connections. Once this is done, you can stop `docker-compose` and start up everything with:

```bash
$ docker-compose up
```

Depending on your setup, you might want to append the `-d` flag to run the containers in the background.

tilt should then be able to connect to the database and start up. If the database takes longer than tilt to start, tilt will restart because of the `restart: always` directive until it can connect successfully.

### Changing user groups

With everything up and running, you usually want to configure tilt. For this, you need to register and change your user group.

Since you have access to the server running tilt, you can spawn a shell in the tilt container and invoke the [usermod script](backend/src/usermod.ts). This script takes two arguments, the email of the user you want to change, as well as the group you want to assign to this user. To assign the `root` group to `you@example.com`, run:

```bash
$ docker-compose exec tilt bash
node@container:/app$ node backend/usermod.js your@example.com root
```

The logs will indicate success or failure and this process works similarly for `moderator`, or for demoting an account back to `user`.

tilt's UI fetches the user role during the initial load. To see the settings, admission and statistics pages, you'll need to reload the page.

### Environment variables

tilt's backend can be configured through a set of environment variables. We try to keep this list up-to-date, but for the most recent set of variables check the [config-service.ts](backend/src/services/config-service.ts). All defaults and shown values are strings, but tilt parses them internally to, e.g., integers or booleans.

#### App variables

- `NODE_ENV` - in production mode, tilt reports all uncaught errors as "Internal error"
  - value: `production` or `development`
  - optional, default: `development`

#### Database variables

- `DATABASE_NAME` - the name of the database tilt should connect to
  - value: string
- `DATABASE_HOST` - the host serving tilt's database
  - value: hostname or IP address
- `DATABASE_PASSWORD` - the password for the database user
  - value: string
- `DATABASE_PORT` - the port number of the database
  - value: integer
  - optional, default: `3306`
- `DATABASE_USERNAME` - the user for the database
  - value: string

#### HTTP variables

- `BASE_URL` - the url under which tilt will be deployed, something in the sorts of `https://your-hackathon.com/apply`
  - value: string
- `PORT` - the http port to listen on
  - value: integer
  - optional, default: `3000`

#### Logging variables

- `LOG_FILENAME` - tilt supports writing its log messages to files; supply a filename to persist log messages
  - value: filename
  - optional, default: `tilt.log`
- `LOG_LEVEL` - the level of logs tilt should output
  - value: `debug`, `info` or `error`
  - optional, default: `info`
- `LOG_SLACK_WEBHOOK_URL` - tilt supports sending errors to a Slack channel; supply an URL to message the configured channel
  - value: Slack webhook URL
  - optional

#### Mail variables

- `MAIL_HOST` - an SMTP server to use for mailing
  - value: hostname
- `MAIL_PASSWORD` - the password for the SMTP account
  - value: string
- `MAIL_PORT` - the port for the SMTP server; tilt requires SSL/TLS
  - value: integer
  - optional, default: `465`
- `MAIL_USERNAME` - the username for the SMTP account
  - value: string

#### Secrets variables

- `SECRET_JWT` - a secret used to sign login tokens
  - value: string

#### Service variables

- `ENABLE_HAVEIBEENPWNED_SERVICE` - enable or disable checking password reuse with [haveibeenpwned.com](https://haveibeenpwned.com)
  - value: `true` or `false`
  - optional, default: `true`

## Contributing

If you found a bug or have an idea for a feature, simply [submit an issue](https://github.com/hackaburg/tilt/issues/new) or a pull request. We use [TSLint](https://palantir.github.io/tslint/) and [Prettier](https://prettier.io) to ensure consistent code styles and we have a set of unit tests for the backend in place to prevent things from breaking too easily. Also, we currently use a [GitHub project](https://github.com/hackaburg/tilt/projects/1) for our roadmap.

### Developing locally

The tilt repository ships with a [docker-compose.yml](docker-compose.yml), which includes a sample setup with MariaDB, the test SMTP server [MailDev](https://github.com/maildev/maildev) and phpMyAdmin. To mimic the proxy'd setup, it also includes build instructions for a tilt container, as well as an NGINX container. You usually only need `db`, `phpmyadmin` and `maildev`, therefore it's sufficient to start them using:

```bash
$ docker-compose up db phpmyadmin maildev
```

For local development, the backend supports reading `.env` files. Refer to [`.env.example`](backend/.env.example) for such a configuration and match the ports from the Docker Compose configuration. You can then start the backend using:

```bash
$ yarn backend::start
```

As the frontend is built in modern React, we use [Webpack](https://webpack.js.org) and its devserver to develop. The backend runs on a different port, so we need to tell the frontend how to reach the backend. This can be done through the `API_BASE_URL` environment variable. To start the frontend devserver with the backend listening on port 3000, simply provide it using:

```bash
$ API_BASE_URL=http://localhost:3000/api yarn frontend::start
```

We also provide a set of utility scripts in our [package.json](package.json)'s `script` section, such as linting, formatting and type-checking.

### Building images

Our final image is built using the `backend::build` and `frontend::build` scripts and stripping development dependencies as well as source files from the final container. To allow arbitrary base urls with a statically built frontend, we transiently replace this url during container startup. Please refer to the [Dockerfile](Dockerfile) and [entrypoint.sh](entrypoint.sh) for more information.

## License

tilt is released under the [MIT License](LICENSE).
