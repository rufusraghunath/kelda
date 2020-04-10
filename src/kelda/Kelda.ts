import JobFactory from '../job/JobFactory';
import ThreadPool from '../thread/ThreadPool';
import KeldaError from './KeldaError';
import WorkLoader from './WorkLoader';

interface WorkCache {
  [key: number]: WorkLoader<any>;
}

interface KeldaOptions {
  threadPoolDepth: number;
}

const defaultOptions = {
  threadPoolDepth: 1
} as KeldaOptions;

class Kelda {
  private threadPool: ThreadPool;
  private cache: WorkCache = {};

  constructor({ threadPoolDepth }: KeldaOptions = defaultOptions) {
    this.threadPool = new ThreadPool(threadPoolDepth);
  }

  public async orderWork<T>(source: Work<T> | string | number): Promise<T> {
    try {
      const work = await this.getWork(source);
      const job = JobFactory.getJob(work);
      const result = await this.threadPool.schedule(job);

      return result;
    } catch (e) {
      this.toKeldaError(e);
    }
  }

  public async load(source: string): Promise<number> {
    const loader = new WorkLoader(source);

    await loader.get();

    const id = Object.keys(this.cache).length + 1;
    this.cache[id] = loader;

    return id;
  }

  public lazy(source: string): number {
    const id = Object.keys(this.cache).length + 1;
    this.cache[id] = new WorkLoader(source);

    return id;
  }

  private async getWork<T>(
    source: Work<T> | string | number
  ): Promise<Work<T>> {
    let work: Work<T>;

    switch (typeof source) {
      case 'function': {
        work = source;
        break;
      }
      case 'string': {
        work = await new WorkLoader<T>(source).get();
        break;
      }
      case 'number': {
        const loader = this.cache[source];

        if (!loader) throw new KeldaError(`Invalid work id: '${source}'`);

        work = await loader.get();

        break;
      }
    }

    return work;
  }

  private toKeldaError(e: Error): never {
    const message = e.message || 'Something went wrong while processing work';

    throw new KeldaError(message);
  }
}

export default Kelda;
