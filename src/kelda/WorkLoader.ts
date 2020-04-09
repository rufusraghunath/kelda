import KeldaError from './KeldaError';

export enum WorkLoadingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

class WorkLoader<T> {
  public status: WorkLoadingStatus = WorkLoadingStatus.NOT_STARTED;
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
    this.status = WorkLoadingStatus.IN_PROGRESS;
    const script = await this.loadScript(url);
    const work = Function(script).call(null);
    // script returns work function

    if (typeof work !== 'function') {
      throw new KeldaError(`Script did not return a work function: '${url}'`);
    }

    work.toString = () => `(function(){${script}})()`;
    // custom toString is needed to maintain context for WorkerJob

    this.status = WorkLoadingStatus.DONE;

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

export default WorkLoader;
