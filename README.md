# Kelda

> "You just leave this tae us, Kelda."
> ― Terry Pratchett, _The Wee Free Men_

Kelda is a thread pool abstraction on top of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Use it to unclutter the main JS thread for a better user experience.

## Usage

⚠️ WARNING: Kelda is still experimental, and its public API is unstable.

To install, run `npm install kelda-js`.

```js
import Kelda from "kelda-js";
import longRunningCalculation from "./longRunningCalculation";

const options = { threadPoolDepth: 3 };
const kelda = new Kelda(options);
// Up to three jobs can be performed at once since a threadPoolDepth of 3 was specified.

const result = await kelda.orderWork(longRunningCalculation);
// longRunningCalculation runs in a Web Worker if available and in the main thread if not.
```

## Limitations

Currently, Kelda can only take orders for simple functions that do not internally reference any module imports (no usage of `import` or `require`). This is because work will be executed in a separate Worker thread, which will have a separate context from the main thread (so no reference to modules provided by build tools such as webpack or rollup). In other words, any work provided to Kelda must be entirely self-contained. This, of course, represents a serious limitation for testing and maintainability of these functions, and Kelda should be considered in "beta" for the time being.

The next phase of development will address this limitation and attempt to provide a solution. At that point, Kelda will be bumped to the first stable release at 1.0.0.

## Testing

Kelda comes with a simple test web app to assist in local development. It makes use of Verdaccio, a local npm registry shim, so that release candidates can be tested in a browser environment before publishing.

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
