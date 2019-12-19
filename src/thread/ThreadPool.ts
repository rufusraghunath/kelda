import Thread from "./Thread";
import KeldaError from "../kelda/KeldaError";

type EnqueuedJob = [Job, Resolve, Reject];

class ThreadPool {
  private static validate(threadPoolDepth: number) {
    if (threadPoolDepth <= 0)
      throw new KeldaError("threadPoolDepth must be greater than 0");
  }

  private threads: Thread[];
  private queue: EnqueuedJob[] = [];

  constructor(threadPoolDepth: number) {
    ThreadPool.validate(threadPoolDepth);

    this.threads = this.populateThreads(threadPoolDepth);
    this.doFromQueue = this.doFromQueue.bind(this);
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
    const enqueued = this.queue.shift();

    if (enqueued) {
      const [job, resolve, reject] = enqueued;

      this.getThread()
        ?.do(job)
        .then(resolve)
        .catch(reject)
        .finally(this.doFromQueue);
    }
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

export default ThreadPool;
