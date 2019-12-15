class MainThreadJob implements Job {
  private work: Work;
  public isDone: boolean = false;

  constructor(work: Work) {
    this.work = work;
  }

  public execute(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const result = this.work();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    }).finally(() => (this.isDone = true));
  }
}

export default MainThreadJob;
