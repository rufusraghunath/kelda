# Technical vision

This document captures the goals and architectural approach of the Kelda project.

## Goal

The purpose of the Kelda project is to provide a managed threadpool abstraction for the browser. It tries to use Web Workers under the hood, and falls back to synchronous computation when this is not possible (although Workers are well-supported by browsers at this point).

One or two similar solutions have been attempted (e.g. [fibrelite](https://github.com/jameslmilner/fibrelite)), but these fall short of being satisfactory because they provide too few features to be truly useful, and because they fail to solve the technical constraints (see below) inherent in Workers. For example, fibrelite:

- Is an abstraction over a single operation, so it cannot manage your entire Worker pool for you (it is possible to call `new Fibrelite(myFunction, threadPoolDepth).execute(args)` too many times and deplete the thread pool, leading to Bad Things).
- Assumes the function passed to it can simply be stringified and turned into a data URI (this is false when using a JS bundler like webpack to resolve module imports)
- Does not provide any functionality beyond the ability to schedule individual function calls on Worker threads

Kelda aims to overcome these shortcomings by providing:

- A global abstraction over Worker threads, thereby guaranteeing that the desired thread pool depth can never be exceeded at any given time
- Either solving the module resolution issue or providing a satisfactory workaround for bundler users
- Opt-in extensions, such as out-of-the box performance profiling that would allow developers to immediately gain insight into the tradeoffs of using Kelda for any given operation (Kelda could even potentially decide by itself which operations to move to Workers without the developer having to know about it)

## Technical background

JavaScript is [single-threaded](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread). Web Workers allow the developer to offload computationally-intensive tasks to separate threads so the main UI thread isn't blocked from doing other important work (e.g. responding to user interaction). Workers can communicate with the main thread via `postMessage` and with each other via `BroadcastChannel`.

Workers do run on separate hardware threads, meaning that there is a hard limit to how many can be used at any one time. It is the responsibility of Kelda to manage the thread pool appropriately, e.g. using a sane default, a user-specified pool depth, or info from `navigator.hardwareConcurrency`.

## Technical constraints

The biggest technical constraints is that functions and therefore their closures cannot be passed to an existing Worker. Instead, a Worker must be initialized with a script to execute, which runs in a separate context from the main thread (i.e. `new Worker(pointerToScript|dataUri|blob)`). This means that:

- Worker threads cannot be generic, reusable, or persistent (except in the case of cronjobs)
- There is some performance overhead to creating and destroying Workers every time a job is requested
- Module resolution is a problem. Bundlers such as webpack cache imports into a global modules object at runtime rather than replacing every reference to a module with the entire module code at build time. This modules object is not available in the Worker context and thus imported modules are `undefined`. Naively, this means that you either have to have a separate build output for a Worker script which you then have to host on your server, or you have to write import-free functions for your Workers to run via dataUri/Blob. Neither approach would make for good DX for Kelda, so another solution must be found.
- Variables that are out of scope of the work function cannot be referenced in the Worker context (this is really the same issue as the above). E.g. if I define a function `fibonacci` outside the scope of my work function, but my work function refers to `fibonacci`, then my work function will stringify to refer to `fibonacci` by name but won't have it available in the Worker
- `bind` is an issue. This results in a stringification like `function () { [native code] }`, which of course can't be evaluated.

## Domain:

- `Kelda`: Outside API - receives Work, turns it into Jobs, and schedules them in the ThreadPool. Also provides top-level error handling.
- `Work`: User-defined task to be carried out by Kelda
- `Job`: interface - wrapper around user-provided work
  - `WorkerJob`: Runs in a Worker
  - `MainThreadJob`: Runs in main thread
  - `ScheduledJob`: (Not implemented yet) Chron job - need Worker and main thread versions?
- `ThreadPool`: Provides thread pool management and allows Jobs to be scheduled as threads become available
- `Thread`: Representation of a "persistent" thread, which can execute one Job at a time

## Open questions/ideas

Can we force bundlers to _not_ cache imports for Worker functions, but instead replace every usage with the whole source code?

Global wrapper around all functions? Could optimize even frameworks like React

- Use ML to drive optimization? Have a sandbox env that switches funcs from Worker to main thread and aggregates data to run regressions against
- Could open source Worker optimization data for common libs, e.g. `moment`
- How would one maintain the unique identifiers for functions?

If we use something like a functional test for determining whether Worker-based optimization is worth it:

- write quantum-level tests
- use a tool like browser stack to determine device payoff matrix

How big is the Worker overhead, anyway? How frequently worth it?

How many Workers can which device maintain without adverse effects?

Is there a point to a Worker generator? Could act like an actual coroutine.

How to notify/throw errors to the developer when doing illegal operations in work passed to Workers (e.g. DOM access)?

What about the arity of work? Should we ask users to wrap everything in a function with no args?

How can we run the tests in a browser environment with real Workers available?

What's the best way to run the tests against the built bundle before publishing?

When Workers are unavailable:

- Should fall back to .getIdleCallback?
- Should space out the work?
- Should respect the threadPoolDepth?
