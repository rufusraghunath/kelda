declare module 'kelda-js' {
  type Work<T> = (...args: any[]) => T;

  interface KeldaOptions {
    threadPoolDepth: number;
  }

  class Kelda {
    constructor(options?: KeldaOptions);

    public orderWork<T>(
      source: Work<T> | string | number,
      ...args: any[]
    ): Promise<T>;
    public load(source: string): Promise<number>;
    public lazy(source: string): number;
  }

  export default Kelda;
}
