declare module "kelda-js" {
  type Work = () => any;

  interface KeldaOptions {
    threadPoolDepth: number;
  }

  class Kelda {
    constructor(options?: KeldaOptions);

    public orderWork(work: Work): Promise<any>;
  }

  export default Kelda;
}
