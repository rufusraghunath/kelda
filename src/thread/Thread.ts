class Thread {
  public isIdle: boolean = true;

  public do<T>(job: Job<T>): Promise<T> {
    this.isIdle = false;

    return job.execute().finally(() => (this.isIdle = true));
  }
}

export default Thread;
