# Kelda

> "You just leave this tae us, Kelda."
> ― Terry Pratchett, _The Wee Free Men_

Kelda is a thread pool abstraction on top of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). Use it to unclutter the main JS thread for a better user experience.

## Usage

⚠️ WARNING: Kelda is still experimental, and its public API is unstable.

```js
import Kelda from "kelda-js";
import longRunningCalculation from "./longRunningCalculation";

const threadPoolDepth = 3;
const kelda = new Kelda(threadPoolDepth);
// Up to three jobs can be performed at once since a threadPoolDepth of 3 was specified.

const result = await kelda.orderWork(longRunningCalculation);
// longRunningCalculation runs in a Web Worker if available and in the main thread if not.
```

## Limitations

Currently, Kelda can only take orders for simple functions that do not internally reference any module imports (no usage of `import` or `require`). This is because work will be executed in a separate Worker thread, which will have a separate context from the main thread (so no reference to modules provided by build tools such as webpack or rollup). In other words, any work provided to Kelda must be entirely self-contained. This, of course, represents a serious limitation for testing and maintainability of these functions, and Kelda should be considered in "beta" for the time being.

The next phase of development will address this limitation and attempt to provide a solution. At that point, Kelda will be bumped to the first stable release at 1.0.0.
