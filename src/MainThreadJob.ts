// Should be renamed to MainThreadJob or UiRuntimeJob?
class MainThreadJob implements Job {
  private work: Work;
  public isDone: boolean = false;

  constructor(work: Work) {
    this.work = work;
  }

  public execute(): Promise<any> {
    const result = this.work();
    this.isDone = true;

    return Promise.resolve(result);
  }
}

export default MainThreadJob;
