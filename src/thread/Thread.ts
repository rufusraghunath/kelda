class Thread {
  public isIdle: boolean = true;

  public do(job: Job): Promise<any> {
    this.isIdle = false;

    return job.execute().finally(() => (this.isIdle = true));
  }
}

export default Thread;
