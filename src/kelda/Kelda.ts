import JobFactory from '../job/JobFactory';
import ThreadPool from '../thread/ThreadPool';
import KeldaError from './KeldaError';

interface WorkCache {
  [key: number]: WorkLoader<any>;
}

interface KeldaOptions {
  threadPoolDepth: number;
}

const defaultOptions = {
  threadPoolDepth: 1
} as KeldaOptions;

class WorkLoader<T> {
  private work: Promise<Work<T>> | undefined;
  private source: string;

  constructor(source: string, lazy: boolean = false) {
    this.source = source;
    if (!lazy) {
      this.work = this.getWorkFromScript(source);
    }
  }

  public get(): Promise<Work<T>> {
    return this.work || this.getWorkFromScript(this.source);
  }

  private async getWorkFromScript<T>(url: string): Promise<Work<T>> {
    const script = await this.loadScript(url);
    const work = Function(script).call(null);
    // script returns work function

    if (typeof work !== 'function') {
      throw new KeldaError(`Script did not return a work function: '${url}'`);
    }

    work.toString = () => `(function(){${script}})()`;
    // custom toString is needed to maintain context for WorkerJob

    return work;
  }

  private loadScript(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        const { readyState, status, responseText, DONE } = xhr;
        if (readyState === DONE) {
          if (status >= 200 && status < 400) {
            resolve(responseText);
          } else {
            reject(new KeldaError(`Could not load work from url: '${url}'`));
          }
        }
      };

      xhr.open('GET', url);
      xhr.send();
    });
  }
}

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
    this.cache[id] = new WorkLoader(source, true);

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
