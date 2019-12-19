enum KeldaWorkerEventTypes {
  START = "$$_KELDA_START",
  DONE = "$$_KELDA_DONE",
  ERROR = "$$_KELDA_ERROR"
}

interface KeldaWorkerMessage {
  type: KeldaWorkerEventTypes;
  result?: any; // TODO: can get rid of this any?
  error?: Error;
}

class WorkerJob implements Job {
  public isDone: boolean = false;
  private worker: Worker | null = null;
  private work: Work;
  private url: string;

  constructor(work: Work) {
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

  public execute(): Promise<any> {
    return this.getWorkPromise().finally(this.cleanUp);
  }

  private cleanUp() {
    this.isDone = true;

    if (this.url) {
      URL.revokeObjectURL(this.url);
    }

    if (this.worker) {
      this.worker.terminate();
    }
  }

  private getWorkPromise(): Promise<any> {
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
    this.worker && this.worker.postMessage(KeldaWorkerEventTypes.START);
  }

  private initWorkerMessageHandling(resolve: Resolve, reject: Reject): void {
    this.worker &&
      this.worker.addEventListener("message", e => {
        const { type, result, error } = e.data as KeldaWorkerMessage;

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
