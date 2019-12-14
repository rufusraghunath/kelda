import MainThreadJob from "./MainThreadJob";

class Kelda {
  private JobConstructor: JobConstructor;

  private static validateThreadPoolDepth(threadPoolDepth: number) {
    if (threadPoolDepth <= 0)
      throw new Error(
        "Error constructing Kelda: threadPoolDepth must be greater than 0"
      );
  }

  constructor(threadPoolDepth: number = 1) {
    Kelda.validateThreadPoolDepth(threadPoolDepth);

    this.JobConstructor = MainThreadJob;
  }

  public orderWork(work: Work): Promise<any> {
    const job = new this.JobConstructor(work); // Could extract to a JobFactory

    return job.execute();
  }
}

export default Kelda;
