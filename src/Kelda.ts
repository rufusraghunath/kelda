import JobFactory from "./job/JobFactory";
import ThreadPool from "./thread/ThreadPool";

interface KeldaOptions {
  threadPoolDepth: number;
}

const defaultOptions = {
  threadPoolDepth: 1
} as KeldaOptions;

class Kelda {
  private threadPool: ThreadPool;

  constructor({ threadPoolDepth }: KeldaOptions = defaultOptions) {
    this.threadPool = new ThreadPool(threadPoolDepth);
  }

  public orderWork(work: Work): Promise<any> {
    const job = JobFactory.getJob(work);

    return this.threadPool.schedule(job);
  }
}

export default Kelda;
