class LocalWorkModule<T> implements WorkModule<T> {
  private work: Work<T>;

  constructor(source: Work<T>) {
    this.work = source;
  }

  public get(): Work<T> {
    // for MainThreadJobs
    return this.work;
  }

  public toString(): string {
    // for WorkerJobs
    return `${this.work}`;
  }
}

export default LocalWorkModule;
