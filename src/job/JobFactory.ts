import MainThreadJob from './MainThreadJob';
import WorkerJob from './WorkerJob';

class JobFactory {
  public static getJob<T>(work: Work<T>): Job<T> {
    return window?.Worker ? new WorkerJob(work) : new MainThreadJob(work);
  }
}

export default JobFactory;
