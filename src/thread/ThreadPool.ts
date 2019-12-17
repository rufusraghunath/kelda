import Thread from "./Thread";

type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type EnqueuedJob = [Job, Resolve, Reject];

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

  private async doFromQueue() {
    const enqueued = this.queue.shift();

    if (enqueued) {
      const [job, resolve, reject] = enqueued;
      const thread = this.getThread();

      if (thread) {
        thread
          .do(job)
          .then(resolve)
          .catch(reject)
          .finally(this.doFromQueue);
      }
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
