import JobFactory from "./job/JobFactory";

type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type EnqueuedJob = [Job, Resolve, Reject];

class Thread {
  public isIdle: boolean = true;

  public do(job: Job): Promise<any> {
    this.isIdle = false;

    return job.execute().finally(() => (this.isIdle = true));
  }
}

class ThreadPool {
  private static validate(threadPoolDepth: number) {
    if (threadPoolDepth <= 0)
      throw new Error("KeldaError: threadPoolDepth must be greater than 0");
    // TODO: custom KeldaError class
  }

  private threads: Thread[];
  private queue: EnqueuedJob[] = [];

  constructor(threadPoolDepth: number) {
    ThreadPool.validate(threadPoolDepth);

    this.threads = this.populateThreads(threadPoolDepth);
  }

  public schedule(job: Job): Promise<any> {
    const thread = this.getThread();

    if (thread) {
      return thread.do(job).finally(this.doFromQueue);
    }

    return new Promise((resolve, reject) => {
      const toEnqueue: EnqueuedJob = [job, resolve, reject];
      this.queue.push(toEnqueue);
    });
  }

  private doFromQueue() {
    // if queue
    // grab a free thread
    // if free thread
    // grab oldest queued job
    // thread.do(job).then(resolve).catch(reject).finally(doFromQueue)
  }

  private populateThreads(threadPoolDepth: number): Thread[] {
    return Array(threadPoolDepth)
      .fill(null)
      .map(() => new Thread());
  }

  private getThread(): Thread | undefined {
    return this.threads.find(thread => thread.isIdle);
  }
}

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
