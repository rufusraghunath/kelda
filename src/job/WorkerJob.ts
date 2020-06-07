enum KeldaWorkerEvent {
  START = '$$_KELDA_START',
  DONE = '$$_KELDA_DONE',
  ERROR = '$$_KELDA_ERROR'
}

type RemoteModuleProvider<T> = () => RemoteModule<T>;

interface KeldaWorkerMessage<T> {
  type: KeldaWorkerEvent;
  result?: T;
  error?: Error;
}

class WorkerJob<T> implements Job<T> {
  public isDone: boolean = false;
  private worker: Worker | null = null;
  private workModule: WorkModule<T>;
  private url?: string;
  private args?: any[];

  constructor(workModule: WorkModule<T>) {
    /*
      Note that Worker creation does *not* happen in the constructor.
      A new Worker is only created when .execute() is called.
      This allows Kelda to queue work efficiently by keeping as many
      Worker threads as possible available at any given time.
    */
    this.cleanUp = this.cleanUp.bind(this);
    this.workModule = workModule;
  }

  public with(...args: any[]): Job<T> {
    this.args = args;
    return this;
  }

  public execute(): Promise<T> {
    this.url = this.getWorkerUrl();
    return this.getWorkPromise().finally(this.cleanUp);
  }

  private cleanUp() {
    this.url && URL.revokeObjectURL(this.url);

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
    this.url = this.getWorkerUrl();

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
    const init = (
      provider: RemoteModuleProvider<T>,
      exportName: string,
      args: any[]
    ) => {
      let isDone = false;
      //@ts-ignore:
      self.onmessage = message => {
        if (!isDone && message.data?.type === '$$_KELDA_START') {
          try {
            // TODO: use await instead of 'result instanceof Promise'
            // This is currently an issue as await transpiles to some
            // TS helpers that don't exist in the MockWorker eval scope

            const module = provider();

            if (typeof module !== 'object') {
              throw new Error(
                'Provided work script did not evaluate to a module object'
              );
            }

            const work = provider()[exportName];

            if (!work) {
              throw new Error(
                `Export '${exportName}' was not found in provided work module`
              );
            }

            const result = work.apply(null, args);

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

    // TODO:
    // .toString() doesn't always work
    // [].toString() === ""
    // "n".toString will remove quotes
    // {}.toString() === [object Object]

    return `(${init})(${this.workModule}, "${this.workModule.exportName}", [${this.args}])`;
  }
}

export default WorkerJob;
