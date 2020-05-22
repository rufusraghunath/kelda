## Open questions

How to deal with TS types for work args?

ObservableJob, using a generator to yield many results over time

Global wrapper around all functions? Could optimize even frameworks like React

Using `Transferrable` to transfer ownership of large args to Workers - bing perf improvement. https://developer.mozilla.org/en-US/docs/Web/API/Transferable, https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

How big is the Worker overhead, anyway? How frequently worth it?

How many Workers can which device maintain without adverse effects?

Is there a point to a Worker generator? Could act like an actual coroutine.

How to notify/throw errors to the developer when doing illegal operations in work passed to Workers (e.g. DOM access)?

When Workers are unavailable:

- Should fall back to .getIdleCallback?
- Should space out the work?
- Should respect the threadPoolDepth?
