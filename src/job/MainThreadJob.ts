class MainThreadJob<T> implements Job<T> {
  private work: Work<T>;
  private args: any[] = [];
  public isDone: boolean = false;

  constructor(work: Work<T>) {
    this.work = work;
  }

  public with(...args: any[]): Job<T> {
    this.args = args;
    return this;
  }

  public execute(): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const result: T = this.work.call(null, ...this.args);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }).finally(() => (this.isDone = true)) as Promise<T>;
  }
}

export default MainThreadJob;
