class MainThreadJob implements Job {
  private work: Work;
  public isDone: boolean = false;

  constructor(work: Work) {
    this.work = work;
  }

  public execute(): Promise<any> {
    const result = this.work();
    this.isDone = true; // TODO: still needs to happen when work throws

    return Promise.resolve(result);
  }
}

export default MainThreadJob;
