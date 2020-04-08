import JobFactory from '../job/JobFactory';
import ThreadPool from '../thread/ThreadPool';
import KeldaError from './KeldaError';

interface WorkMap {
  [key: number]: Work<any>;
}

interface KeldaOptions {
  threadPoolDepth: number;
}

const defaultOptions = {
  threadPoolDepth: 1
} as KeldaOptions;

class Kelda {
  private threadPool: ThreadPool;
  private workMap: WorkMap = {};

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
    const work = await this.getWorkFromScript(source);
    const id = Object.keys(this.workMap).length + 1;

    this.workMap[id] = work;

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
        work = await this.getWorkFromScript(source);
        break;
      }
      case 'number': {
        work = this.workMap[source];

        if (!work) throw new KeldaError(`Invalid work id: '${source}'`);

        break;
      }
    }

    return work;
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

  private toKeldaError(e: Error): never {
    const message = e.message || 'Something went wrong while processing work';

    throw new KeldaError(message);
  }
}

export default Kelda;
