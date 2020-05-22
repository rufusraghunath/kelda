# Kelda

> "You just leave this tae us, Kelda."
> ― Terry Pratchett, _The Wee Free Men_

Kelda is a thread pool abstraction on top of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Use it to unclutter the main JS thread for a better user experience.

## Technical background

JavaScript is [single-threaded](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread). Web Workers allow the developer to offload computationally-intensive tasks to separate threads so the main UI thread isn't blocked from doing other important work (e.g. responding to user interaction). Workers can communicate with the main thread via `postMessage` and with each other via `BroadcastChannel`.

Workers do run on separate hardware threads, meaning that there is a hard limit to how many can be used at any one time. It is the responsibility of Kelda to manage the thread pool appropriately, e.g. using a sensible default or a user-specified pool depth.

## Usage

⚠️ WARNING: Kelda is still experimental, and its public API is unstable.

To install, run `npm install kelda-js`.

To use Kelda, create specific functions for the work you'd like Kelda to perform in a Web Worker, and pass them to Kelda at will. You can either pass a function, or a URL to a remote work module (more on both these options below).

Note that the arguments you pass to your work functions, as well as the return values of your work functions, cannot themselves be or contain functions. This is because only data of types supported by the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) can be sent between the main thread and Worker threads.

```js
import Kelda from 'kelda-js';
import longRunningCalculation from './longRunningCalculation';

const options = { threadPoolDepth: 3 };
const kelda = new Kelda(options);
// Up to three jobs can be performed at once since a threadPoolDepth of 3 was specified.

const result = await kelda.orderWork(longRunningCalculation);
// longRunningCalculation runs in a Web Worker if available and in the main thread if not.
// Work functions you pass to Kelda *must* be entirely self-contained,
// and cannot contain any references to variables from outside their scope.

const result2 = await kelda.orderWork({
  url: '/path/to/work/module',
  exportName: 'myWork'
});
// If your work function requires variables outside its scope (e.g. other modules),
// you may expose it as a remote module.
// Simply provide Kelda with the URL of the script and the name of the work export (defaults to "default")

const eagerId = await kelda.load({ url: '/path/to/work/module' });
const lazyId = kelda.lazy({ url: '/path/to/work/module' });
// For ease of reuse, you may also load a remote work module directly into Kelda in exchange for a work ID.
// You can then execute the work repeatedly using that work ID, passing different arguments as needed.

const result3 = await kelda.orderWork(eagerId, arg1, arg2);
// Script is already loaded - eager
const result4 = await kelda.orderWork(lazyId, arg1, arg2);
// Script won't load until the first call to .orderWork() with this ID - lazy
```

## Working with remote work modules

### What are remote work modules?

A remote work module is a regular ES module with exports corresponding to the work functions you want to expose. The trick is that you'll need to compile this module to a JS bundle with a special property: _it must return a module-like object when evaluated, with key-value pairs corresponding to the module's exports._ This provides Kelda a way to hook into your module and retrieve your work functions in a Worker thread.

You are responsible for managing the build chain for your work modules, but some examples are provided below.

### Why use remote work modules?

Due to the limitations of Web Workers, we cannot pass functions from the main thread to a worker thead. Instead, Kelda stringifies functions that you pass to it, and `eval`s them in the Worker thread\*. This approach cannot recursively copy references to the worker thread, so any variable referenced in the work function must be defined inside it.

For most practical usecases, you will probably want to be able to reference variables outside of the scope of your work functions. Apart from allowing you to modulerize your code, this will also enable you to take advantage of the wider JS ecosystem (e.g. using npm modules, or TypeScript). In this case, you cannot pass a function directly to Kelda - instead, you'll have to use a remote work module.

_\*Important note: do not ever put dynamic, user-generated content into a work module. Due to the nature of `eval` this is a potential cross-site scripting attack vector._

### Bundling remote work modules

You can bundle a work module in any way you like, as long as it returns a module-like object. There are multiple build tools available in the JS ecosystem that you can use to achieve this, depending on your preference. Let's see how this should work from an example.

Given the following work modules, how might we bundle them for Kelda?

```js
// work/sayHello.js'

import localizedGreeting from '../localizedGreeting';

export function sayHello(name, locale) {
  const greeting = localizedGreeting(locale);

  return `${greeting}, ${name}!`;
}
```

```js
// work/inefficientFibonacci.js'

export default function inefficientFibonacci(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;

  return inefficientFibonacci(n - 1) + inefficientFibonacci(n - 2);
}
```

For Kelda to work with these work modules, we need to bundle them into scripts that evaluate to the following:

- The bundle for `sayHello.js` should `eval` to `{ sayHello: function(){...} }`
- The bundle for `inefficientFibonacci.js` should `eval` to `{ default: function(){...} }`

### Using webpack

Here's an example implementation of bundling remote work modules with webpack:

1. Create a separate webpack config file for your work modules
2. Make your work modules the entry points
3. Add any config options you might want (e.g. you might want to extend your regular webpack config)
4. npm/yarn install `terser-webpack-plugin`
5. Add a custom `TerserPlugin` to your webpack config that turns off the `negate_iife` and `side_effects` optimizations
6. Add build task to your `package.json` - e.g. `"build-work-scripts": "webpack --mode=production --config=./work.webpack.config.js"`
7. Expose work bundles on your server (e.g. through `public` folder) - this makes remote work modules "remote", as they are loaded separately from the main JS bundle
8. Pass URL of work scripts to Kelda (see usage examples above)

The custom `TerserPlugin` will prevent terser from removing the return value of your module (the exports) in production mode. Note that this will opt out of those optimizations for the entire build process, so you may end up with a larger bundle. Other build tools may have a more elegant way of bundling a work module.

```js
// work.webpack.config.js

const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // ...your other webpack config here
  entry: {
    sayHello: './work/sayHello.js',
    inefficientFibonacci: './work/inefficientFibonacci.js'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        //...your other terser config here
        terserOptions: {
          compress: {
            negate_iife: false,
            side_effects: false
          }
        }
      })
    ]
  }
};
```

## Goal

The purpose of the Kelda project is to provide a managed threadpool abstraction for the browser. It tries to use Web Workers under the hood, and falls back to computation in the main thread when this is not possible (although Workers are well-supported by browsers at this point).

One or two similar solutions have been attempted (e.g. [fibrelite](https://github.com/jameslmilner/fibrelite)), but these fall short of being satisfactory because they provide too few features to be truly useful, and because they fail to solve the technical constraints (see below) inherent in Workers. For example, fibrelite:

- Is an abstraction over a single operation, so it cannot manage your entire Worker pool for you (it is possible to call `new Fibrelite(myFunction, threadPoolDepth).execute(args)` too many times and deplete the thread pool, leading to Bad Things).
- Assumes the function passed to it can simply be stringified and turned into a data URI (this is false if the function references variables outside its own scope, including references to other modules)
- Does not provide any functionality beyond the ability to schedule individual function calls on Worker threads

Kelda aims to overcome these shortcomings by providing:

- A global abstraction over Worker threads, thereby guaranteeing that the desired thread pool depth can never be exceeded at any given time
- Solving the variable scoping issue or providing a satisfactory workaround (currently doing this by having the user create separate build outputs for their worker scripts)
- Opt-in extensions, such as out-of-the box performance profiling that would allow developers to immediately gain insight into the tradeoffs of using Kelda for any given operation (Kelda could even potentially decide by itself which operations to move to Workers without the developer having to know about it)

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
