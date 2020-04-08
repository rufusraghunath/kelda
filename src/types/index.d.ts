declare module 'kelda-js' {
  type Work<T> = () => T;

  interface KeldaOptions {
    threadPoolDepth: number;
  }

  class Kelda {
    constructor(options?: KeldaOptions);

    public orderWork<T>(source: Work<T> | string | number): Promise<T>;
    public load(source: string): Promise<number>;
  }

  export default Kelda;
}
