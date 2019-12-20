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
    this.worker?.postMessage(KeldaWorkerEventTypes.START);
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
    // TODO: find way to have this typechecked
    // TODO: use onerror for error handling instead?
    // TODO: isDone flow is not yet tested
    return `
      let isDone = false;
      self.onmessage = message => {
        if(!isDone && message === "${KeldaWorkerEventTypes.START}") {
          try{
            const result = (${this.work}).call(null);
            self.postMessage({
              type: "${KeldaWorkerEventTypes.DONE}",
              result
            });
          } catch(error) {
            self.postMessage({
              type: "${KeldaWorkerEventTypes.ERROR}",
              error
            });
          } finally {
            isDone = true;
          }
        }
      }
    `;
  }
}

export default WorkerJob;
