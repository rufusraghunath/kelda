# Contributing

## Local setup

- Clone the repo - `git clone https://github.com/rufusraghunath/kelda.git`
- Run `npm i`
- Run `npm test` to run tests

## Bugs

Report issues [here](https://github.com/rufusraghunath/kelda/issues). Please include as much detail as possible, including steps to reproduce the issue.

## Pull requests

I welcome [PRs](https://github.com/rufusraghunath/kelda/pulls) and suggestions. Please include a detailed rationale with your PR so I can review the changes appropriately.

## Testing

Kelda comes with a simple test web app to assist in local development. It makes use of [Verdaccio](https://github.com/verdaccio/verdaccio), a local npm registry shim, so that release candidates can be tested in a browser environment before publishing.

To set up:

```bash
cd test-app
npm install

cd ..
npm run local-registry
# This runs Verdaccio and will prompt you for a username and password to use for the registry shim
```

To publish to the local registry shim, run `npm run local-registry:publish`. This will deploy the latest local changes to your local Verdaccio. Note that Verdaccio has to be running for this to work (`npm run local-registry`).

To start the test app, run `npm run test-app`. This will pull the latest changes to Kelda from your local Verdaccio, build the test app, and start a server for the test app on port `8080`. Note that Verdaccio has to be running for this to work (`npm run local-registry`).

In the future, the test app will support a simple browser-based functional test to provide automated regression assurance before publishing.
