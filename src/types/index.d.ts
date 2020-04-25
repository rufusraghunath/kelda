declare module 'kelda-js' {
  type Work<T> = (...args: any[]) => T;

  interface KeldaOptions {
    threadPoolDepth: number;
  }

  interface RemoteWorkParams {
    url: string;
    exportName?: string;
  }

  class Kelda {
    constructor(options?: KeldaOptions);

    public orderWork<T>(
      source: Work<T> | RemoteWorkParams | number,
      ...args: any[]
    ): Promise<T>;
    public load(params: RemoteWorkParams): Promise<number>;
    public lazy(params: RemoteWorkParams): number;
  }

  export default Kelda;
}
