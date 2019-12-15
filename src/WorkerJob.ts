type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;

enum KeldaWorkerEventTypes {
  START = "$$_KELDA_START",
  DONE = "$$_KELDA_DONE",
  ERROR = "$$_KELDA_ERROR"
}

interface KeldaWorkerMessage {
  type: KeldaWorkerEventTypes;
  result: any; // TODO: can get rid of this?
  error?: Error;
}

class WorkerJob implements Job {
  private work: Work;
  public isDone: boolean = false;

  constructor(work: Work) {
    this.work = work;
  }

  public execute(): Promise<any> {
    const result = this.getWorkPromise();
    this.isDone = true; // TODO: needs to happen in .then and .catch

    return result;
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
    const url = this.getWorkerUrl();
    const worker = new Worker(url);

    this.initWorkerMessageHandling(worker, resolve, reject);
    this.startWork(worker);
  }

  private startWork(worker: Worker): void {
    worker.postMessage(KeldaWorkerEventTypes.START);
  }

  private initWorkerMessageHandling(
    worker: Worker,
    resolve: Resolve,
    reject: Reject
  ): void {
    worker.addEventListener("message", e => {
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
