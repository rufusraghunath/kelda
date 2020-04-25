import KeldaError from '../kelda/KeldaError';
import RemoteWorkModule from './RemoteWorkModule';

class WorkModuleLoader {
  private url: string;
  private exportName: string;
  private script: Promise<string> | undefined;

  constructor(url: string, exportName: string = 'default') {
    this.url = url;
    this.exportName = exportName;
  }

  public async get<T>(): Promise<RemoteWorkModule<T>> {
    this.script = this.script || this.loadScript(this.url);

    return new RemoteWorkModule(await this.script, this.exportName);
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

export default WorkModuleLoader;
