class WorkerJob implements Job {
  private static START_WORK = "$$_KELDA_START";
  private work: Work;
  public isDone: boolean = false;

  constructor(work: Work) {
    this.work = work;
  }

  public execute(): Promise<any> {
    const resultPromise = this.doInWorker();
    this.isDone = true;

    return resultPromise;
  }

  private doInWorker(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWorkerUrl();
        const worker = new Worker(url);

        worker.addEventListener("message", resolve);
        worker.postMessage(WorkerJob.START_WORK);
      } catch (e) {
        reject(e);
      }
    });
  }

  private getWorkerUrl(): string {
    const script = this.getWorkerScript();

    // const blob = new Blob([script], {
    //   type: "text/javascript"
    // });

    // const url = URL.createObjectURL(blob);

    return script;
  }

  private getWorkerScript(): string {
    // TODO: find way to have this typechecked
    return `
      let isDone = false;

      self.onmessage = message => {
        if(!isDone && message === "${WorkerJob.START_WORK}") {
          const result = (${this.work}).call(null);

          isDone = true;

          self.postMessage(result);
        }
      }
    `;
  }
}

export default WorkerJob;
