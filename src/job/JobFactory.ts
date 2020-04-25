import MainThreadJob from './MainThreadJob';
import WorkerJob from './WorkerJob';

class JobFactory {
  public static getJob<T>(workModule: WorkModule<T>): Job<T> {
    return window?.Worker
      ? new WorkerJob(workModule)
      : new MainThreadJob(workModule);
  }
}

export default JobFactory;
