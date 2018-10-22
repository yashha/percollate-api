## Description

Public API to transform website content to pdf.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# incremental rebuild (webpack)
$ npm run webpack
$ npm run start:hmr

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API

- GET: /pdf
  - Query: mutiple url queries possible  
    other queries are other options of percollate
- POST: /pdf
  - Query: mutiple url queries possible  
  - Params: other options of percollate
