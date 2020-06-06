## Open questions

Can we use Deno's bundle capabilty to build work scripts? Kit mentioned that Deno compiles to ECMAScript modules.

Chrome 80 supports module Workers out of the box, using `type: 'module'`. In the future, Kelda could use this intead of forcing users to maintain a build chain that compiles to evalable modules. https://web.dev/module-workers/

Deno uses Web Workers for threading, using the `type: 'module'` option. How can Kenda support this? https://deno.land/manual/runtime/workers

How to deal with TS types for work args?

ObservableJob, using a generator to yield many results over time

Using `Transferrable` to transfer ownership of large args to Workers - big perf improvement. https://developer.mozilla.org/en-US/docs/Web/API/Transferable, https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

How big is the Worker overhead, anyway? How frequently worth it?

How many Workers can which device maintain without adverse effects?

Is there a point to a Worker generator? Could act like an actual coroutine.

How to notify/throw errors to the developer when doing illegal operations in work passed to Workers (e.g. DOM access)?

When Workers are unavailable:

- Should fall back to .getIdleCallback?
- Should space out the work?
- Should respect the threadPoolDepth?
