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
// Up to three jobs can be performed at once sice a threadPoolDepth of 3 was specified.

const result = await kelda.orderWork(longRunningCalculation);
// longRunningCalculation runs in a Web Worker if available and in the main thread if not.
```
