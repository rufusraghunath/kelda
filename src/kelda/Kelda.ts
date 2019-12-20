import JobFactory from "../job/JobFactory";
import ThreadPool from "../thread/ThreadPool";
import KeldaError from "./KeldaError";

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

  public orderWork<T>(work: Work<T>): Promise<T> {
    const job = JobFactory.getJob(work);

    return this.threadPool.schedule(job).catch(this.toKeldaError);
  }

  private toKeldaError(e: Error): never {
    const message = e.message || "Something went wrong while processing work";

    throw new KeldaError(message);
  }
}

export default Kelda;
