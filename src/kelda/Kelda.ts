import JobFactory from '../job/JobFactory';
import ThreadPool from '../thread/ThreadPool';
import KeldaError from './KeldaError';
import WorkModuleLoader from '../work/WorkModuleLoader';
import LocalWorkModule from '../work/LocalWorkModule';

interface WorkCache {
  [key: number]: WorkModuleLoader;
}

interface KeldaOptions {
  threadPoolDepth: number;
}

interface RemoteWorkParams {
  url: string;
  exportName?: string;
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

  public async orderWork<T>(
    source: Work<T> | RemoteWorkParams | number,
    ...args: any[]
  ): Promise<T> {
    try {
      const work = await this.getWorkModule(source);
      const job = JobFactory.getJob(work).with(args);
      const result = await this.threadPool.schedule(job);

      return result;
    } catch (e) {
      this.toKeldaError(e);
    }
  }

  public async load({ url, exportName }: RemoteWorkParams): Promise<number> {
    const loader = new WorkModuleLoader(url, exportName);

    await loader.get();

    const id = Object.keys(this.cache).length + 1;
    this.cache[id] = loader;

    return id;
  }

  public lazy({ url, exportName }: RemoteWorkParams): number {
    const id = Object.keys(this.cache).length + 1;
    this.cache[id] = new WorkModuleLoader(url, exportName);

    return id;
  }

  private async getWorkModule<T>(
    source: Work<T> | RemoteWorkParams | number
  ): Promise<WorkModule<T>> {
    switch (typeof source) {
      case 'function': {
        return new LocalWorkModule(source);
      }
      case 'object': {
        const { url, exportName } = source;
        return new WorkModuleLoader(url, exportName).get();
      }
      case 'number': {
        const loader = this.cache[source];

        if (!loader) throw new KeldaError(`Invalid work id: '${source}'`);

        return loader.get();
      }
    }
  }

  private toKeldaError(e: Error): never {
    const message = e.message || 'Something went wrong while processing work';

    throw new KeldaError(message);
  }
}

export default Kelda;
