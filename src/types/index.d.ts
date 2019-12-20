declare module "kelda-js" {
  type Work<T> = () => T;

  interface KeldaOptions {
    threadPoolDepth: number;
  }

  class Kelda {
    constructor(options?: KeldaOptions);

    public orderWork<T>(work: Work<T>): Promise<T | void>;
  }

  export default Kelda;
}
