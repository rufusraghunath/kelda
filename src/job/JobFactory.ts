import MainThreadJob from "./MainThreadJob";
import WorkerJob from "./WorkerJob";

class JobFactory {
  public static getJob(work: Work): Job {
    return window && window.Worker
      ? new WorkerJob(work)
      : new MainThreadJob(work);
  }
}

export default JobFactory;
