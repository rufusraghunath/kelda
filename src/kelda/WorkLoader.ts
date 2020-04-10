import KeldaError from './KeldaError';

class WorkLoader<T> {
  private work: Promise<Work<T>> | undefined;
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  public get(): Promise<Work<T>> {
    this.work = this.work || this.getWorkFromScript(this.source);
    return this.work;
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

export default WorkLoader;
