import JobFactory from "./job/JobFactory";

interface KeldaOptions {
  threadPoolDepth: number;
}

const defaultOptions = {
  threadPoolDepth: 1
};

class Kelda {
  private static validateThreadPoolDepth(threadPoolDepth: number) {
    if (threadPoolDepth <= 0)
      throw new Error("KeldaError: threadPoolDepth must be greater than 0");
  }

  constructor({ threadPoolDepth }: KeldaOptions = defaultOptions) {
    Kelda.validateThreadPoolDepth(threadPoolDepth);
  }

  public orderWork(work: Work): Promise<any> {
    const job = JobFactory.getJob(work);

    return job.execute();
  }
}

export default Kelda;
