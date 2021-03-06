class MainThreadJob<T> implements Job<T> {
  public isDone: boolean = false;
  private args: any[] = [];
  private workModule: WorkModule<T>;

  constructor(work: WorkModule<T>) {
    this.workModule = work;
  }

  public with(args: any[]): Job<T> {
    this.args = args;
    return this;
  }

  public execute(): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const work = this.workModule.get();
        const result: T = work.call(null, ...this.args);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }).finally(() => (this.isDone = true)) as Promise<T>;
  }
}

export default MainThreadJob;
