enum KeldaWorkerEvent {
  START = '$$_KELDA_START',
  DONE = '$$_KELDA_DONE',
  ERROR = '$$_KELDA_ERROR'
}

interface KeldaWorkerMessage<T> {
  type: KeldaWorkerEvent;
  result?: T;
  error?: Error;
}

// THOUGHTS
// - Can I pass a string as an arg instead, which points to the module containing the work?
// - Could we expose a Worker wrapper (called "KeldaWork"?) that would remove all the need for hand-rolling the communication bit?
//   Then we could still take advantage of things like the worker-loader on the client's end
//   Really, one of the issues is that I don't want the user to have to deal with an extra bundle for the Worker
//   https://github.com/webpack-contrib/worker-loader
//   https://github.com/borisirota/webworkify-webpack
//   https://github.com/danderson00/webpack-worker

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
    this.url = this.getWorkerUrl(); // TODO: Should only get called on .execute()
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
    this.worker?.postMessage({ type: KeldaWorkerEvent.START });
  }

  private initWorkerMessageHandling(resolve: Resolve, reject: Reject): void {
    this.worker?.addEventListener('message', e => {
      const { type, result, error } = e.data as KeldaWorkerMessage<T>;

      switch (type) {
        case KeldaWorkerEvent.DONE: {
          resolve(result);
          break;
        }
        case KeldaWorkerEvent.ERROR: {
          reject(error);
          break;
        }
      }
    });
  }

  private getWorkerUrl(): string {
    const script = this.getWorkerScript();
    const blob = new Blob([script], { type: 'text/javascript' });
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

    /* eslint-disable require-atomic-updates, no-restricted-globals */

    // Coverage cannot be collected from the init function as it is stringified and eval'd
    /* istanbul ignore next */
    const init = (work: Work<T>) => {
      let isDone = false;
      //@ts-ignore:
      self.onmessage = message => {
        if (!isDone && message.data?.type === '$$_KELDA_START') {
          try {
            // TODO: use await instead of 'result instanceof Promise'
            // This is currently an issue as await transpiles to some
            // TS helpers that don't exist in the MockWorker eval scope
            //@ts-ignore:

            const result = work.call(null);

            if (result instanceof Promise) {
              result.then(unwrappedResult => {
                //@ts-ignore:
                self.postMessage({
                  type: '$$_KELDA_DONE',
                  result: unwrappedResult
                });
              });
            } else {
              //@ts-ignore:
              self.postMessage({
                type: '$$_KELDA_DONE',
                result
              });
            }

            //@ts-ignore:
            self.postMessage({
              type: '$$_KELDA_DONE',
              result
            });
          } catch (error) {
            //@ts-ignore:
            self.postMessage({
              type: '$$_KELDA_ERROR',
              error
            });
          } finally {
            isDone = true;
          }
        }
      };
    };

    return `(${init})(${this.work})`;
  }
}

export default WorkerJob;
