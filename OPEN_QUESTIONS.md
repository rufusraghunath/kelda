## Open questions

How to deal with TS types for work args?

ObservableJob, using a generator to yield many results over time

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

When Workers are unavailable:

- Should fall back to .getIdleCallback?
- Should space out the work?
- Should respect the threadPoolDepth?
