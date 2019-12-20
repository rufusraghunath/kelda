class MainThreadJob<T> implements Job<T> {
  private work: Work<T>;
  public isDone: boolean = false;

  constructor(work: Work<T>) {
    this.work = work;
  }

  public execute(): Promise<T> {
    // TODO: Extract to tryInPromise?
    return new Promise((resolve, reject) => {
      try {
        const result: T = this.work();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }).finally(() => (this.isDone = true)) as Promise<T>;
  }
}

export default MainThreadJob;
