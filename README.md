# Kelda

> "You just leave this tae us, Kelda."
> ― Terry Pratchett, _The Wee Free Men_

Kelda is a thread pool abstraction on top of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Use it to unclutter the main JS thread for a better user experience.

## Usage

⚠️ WARNING: Kelda is still experimental, and its public API is unstable.

To install, run `npm install kelda-js`.

```js
import Kelda from 'kelda-js';
import longRunningCalculation from './longRunningCalculation';

const options = { threadPoolDepth: 3 };
const kelda = new Kelda(options);
/*
  Up to three jobs can be performed at once since a threadPoolDepth of 3 was specified.
*/

const result = await kelda.orderWork(longRunningCalculation);
/*
  longRunningCalculation runs in a Web Worker if available and in the main thread if not.

  Work functions you pass to Kelda *must* be entirely self-contained and cannot contain any references to variables from outside their scope.
*/

const result2 = await kelda.orderWork({
  url: '/path/to/work/module',
  exportName: 'myWork'
});
/*
  If your work function requires variables outside its scope (e.g. other modules), you may expose it as a remote module.
  The remote module can be any JS script that evaluates to an object in which Kelda can look for your work function.
  Simply provide Kelda with the URL of the module and the name of the work export (defaults to "default")
*/

const eagerId = await kelda.load({ url: '/path/to/work/module' });
const lazyId = kelda.lazy({ url: '/path/to/work/module' });
/*
  For ease of reuse, you may also load a remote work module directly into Kelda in exchange for a work ID.
  You can then execute the work repeatedly using that work ID, passing different arguments as needed.
*/

const result3 = await kelda.orderWork(eagerId, arg1, arg2);
// Script is already loaded - eager
const result4 = await kelda.orderWork(lazyId, arg1, arg2);
// Script won't load until the first call to .orderWork() with this ID - lazy
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

## Technical background

JavaScript is [single-threaded](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread). Web Workers allow the developer to offload computationally-intensive tasks to separate threads so the main UI thread isn't blocked from doing other important work (e.g. responding to user interaction). Workers can communicate with the main thread via `postMessage` and with each other via `BroadcastChannel`.

Workers do run on separate hardware threads, meaning that there is a hard limit to how many can be used at any one time. It is the responsibility of Kelda to manage the thread pool appropriately, e.g. using a sane default, a user-specified pool depth, or info from `navigator.hardwareConcurrency`.

## Technical constraints

The biggest technical constraints is that functions and therefore their closures cannot be passed to an existing Worker. Instead, a Worker must be initialized with a script to execute, which runs in a separate context from the main thread (i.e. `new Worker(pointerToScript|dataUri|blob)`). This means that:

- Worker threads cannot be generic, reusable, or persistent (except in the case of cronjobs)
- There is some performance overhead to creating and destroying Workers every time a job is requested
- Variables that are out of scope of the work function cannot be referenced in the Worker context (including module imports). E.g. if I define a function `fibonacci` outside the scope of my work function, but my work function refers to `fibonacci`, then my work function will stringify to refer to `fibonacci` by name but won't have it available in the Worker. This is why we have to define separate build outputs for our worker scripts and pass the url to Kelda.

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
