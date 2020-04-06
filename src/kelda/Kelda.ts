import JobFactory from '../job/JobFactory';
import ThreadPool from '../thread/ThreadPool';
import KeldaError from './KeldaError';

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

  public async orderWork<T>(source: Work<T> | string): Promise<T> {
    try {
      const work: Work<T> =
        typeof source === 'function' ? source : await this.loadWork(source);
      const job = JobFactory.getJob(work);
      const result = await this.threadPool.schedule(job);

      return result;
    } catch (e) {
      this.toKeldaError(e);
    }
  }

  private async loadWork<T>(url: string): Promise<Work<T>> {
    const script = await new Promise<string>((resolve, reject) => {
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

    return this.workFromScript(script, url);
  }

  private workFromScript<T>(script: string, url: string): Work<T> {
    const work = Function(script).call(null);
    // script returns work function

    if (typeof work !== 'function') {
      throw new KeldaError(`Script did not return a work function: '${url}'`);
    }

    work.toString = () => `(function(){${script}})()`;
    // custom toString is needed to maintain context for WorkerJob

    return work;
  }

  private toKeldaError(e: Error): never {
    const message = e.message || 'Something went wrong while processing work';

    throw new KeldaError(message);
  }
}

export default Kelda;
