# Localful Server
The Localful server is developed using Express.js and provides an HTTP API and Websocket
server for syncing content between devices, backing up content to the server and managing user accounts.

## Before you begin
- [PostgreSQL](https://www.postgresql.org/) is required to run the database. You must also set up the database as per the example in `scripts/example.setup.sql`.
- Redis


## Setting up the app

```bash
# === setup database ===

# this script will create a `localful` user & database, alternatively create your own database and set the env vars accordingly.
$ psql postgres -f < ./scripts/setup.sql

# run database migrations to setup the required tables in your database
$ psql postgres -f < ./migrations/000-v1-schema.sql

# === install dependencies ===
$ npm install

# === setup environment ===
# you will have to configure the AUTH_ variables and DATABASE_URL if you edited the setup.sql script
$ cp .env.example .env
```

## Running the app

```bash
# === development mode ===
# run the app via tsx and restart on changes
$ npm run start

# === production build ===
# will build the app using tsc then tsc-alias (which fixes alias/path imports in the build)
$ npm run build

# === run the production build ===
# will run the build directly using node
$ npm run start:prod
```

## Testing the app

```bash
# run all tests
$ npm run test

# === run e2e tests ===
# tests that load the full application (via a test helper which provides setup/teardown and utility functions), make requests using supertest like a real API user, and assert on the results
$ npm run test:e2e

# === run unit tests ===
# tests which focus on isolated functionality directly, covering cases E2E tests miss and features which benefit from internal testing
$ npm run test:unit
```
