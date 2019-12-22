enum KeldaWorkerEventTypes {
  START = "$$_KELDA_START",
  DONE = "$$_KELDA_DONE",
  ERROR = "$$_KELDA_ERROR"
}

interface KeldaWorkerMessage<T> {
  type: KeldaWorkerEventTypes;
  result?: T;
  error?: Error;
}

class WorkerJob<T> implements Job<T> {
  public isDone: boolean = false;
  private worker: Worker | null = null;
  private work: Work<T>;
  private url: string;

  constructor(work: Work<T>) {
    /*
      Note that Worker creation does *not* happen in the constructor.
      A new Worker is only created when .execute() is called.
      This allows Kelda to queue work efficiently by keeping as many
      Worker threads as possible available at any given time.
    */
    this.cleanUp = this.cleanUp.bind(this);
    this.work = work;
    this.url = this.getWorkerUrl();
  }

  public execute(): Promise<T> {
    return this.getWorkPromise().finally(this.cleanUp);
  }

  private cleanUp() {
    URL.revokeObjectURL(this.url);

    this.worker?.terminate();

    this.isDone = true;
  }

  private getWorkPromise(): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        this.doWorkInWorker(resolve, reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  private doWorkInWorker(resolve: Resolve, reject: Reject): void {
    this.worker = new Worker(this.url);

    this.initWorkerMessageHandling(resolve, reject);
    this.startWork();
  }

  private startWork(): void {
    this.worker?.postMessage({ type: KeldaWorkerEventTypes.START });
  }

  private initWorkerMessageHandling(resolve: Resolve, reject: Reject): void {
    this.worker?.addEventListener("message", e => {
      const { type, result, error } = e.data as KeldaWorkerMessage<T>;

      switch (type) {
        case KeldaWorkerEventTypes.DONE: {
          resolve(result);
          break;
        }
        case KeldaWorkerEventTypes.ERROR: {
          reject(error);
          break;
        }
      }
    });
  }

  private getWorkerUrl(): string {
    const script = this.getWorkerScript();
    const blob = new Blob([script], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    return url;
  }

  private getWorkerScript(): string {
    // TODO: Test new version of this method
    // TODO: isDone flow is not yet tested
    // TODO: Rethrow DataCloneErrors with helpful hints about allowable return types of Work?
    // TODO: Remove tsignores if possible
    // TODO: Remove eslint-disables if possible
    // TODO: Find way not to hardcode event types

    // This fools Typescript into believing that the variable 'work' is defined in the scope of init.
    // In fact, work is stringified and concatenated with init in the worker script.
    // Could pass work as an arg to init to avoid this
    const work = this.work;

    /* eslint-disable require-atomic-updates, no-restricted-globals */

    // Coverage cannot be collected from the init function as it is stringified and eval'd
    /* istanbul ignore next */
    const init = () => {
      let isDone = false;
      //@ts-ignore:
      self.onmessage = message => {
        if (!isDone && message.data?.type === "$$_KELDA_START") {
          try {
            // TODO: use await instead of 'result instanceof Promise'
            // This is currently an issue as await transpiles to some
            // TS helpers that don't exist in the MockWorker eval scope
            const result = work.call(null);

            if (result instanceof Promise) {
              result.then(unwrappedResult => {
                //@ts-ignore:
                self.postMessage({
                  type: "$$_KELDA_DONE",
                  result: unwrappedResult
                });
              });
            } else {
              //@ts-ignore:
              self.postMessage({
                type: "$$_KELDA_DONE",
                result
              });
            }

            //@ts-ignore:
            self.postMessage({
              type: "$$_KELDA_DONE",
              result
            });
          } catch (error) {
            //@ts-ignore:
            self.postMessage({
              type: "$$_KELDA_ERROR",
              error
            });
          } finally {
            isDone = true;
          }
        }
      };
    };

    return `work=${this.work};(${init})()`;
  }
}

export default WorkerJob;
