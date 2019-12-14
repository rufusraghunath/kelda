import MainThreadJob from "./MainThreadJob";

class Kelda {
  private JobConstructor: JobConstructor;

  constructor() {
    this.JobConstructor = MainThreadJob;
  }

  public orderWork(work: Work): Promise<any> {
    const job = new this.JobConstructor(work); // Could extract to a JobFactory

    return job.execute();
  }
}

export default Kelda;
