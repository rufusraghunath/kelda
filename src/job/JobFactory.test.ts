import JobFactory from './JobFactory';
import WorkerJob from './WorkerJob';
import MainThreadJob from './MainThreadJob';
import { work, withoutWorkers } from '../util/testUtils';

describe('JobFactory', () => {
  it('should produce WorkerJobs when Workers are available', () => {
    expect(JobFactory.getJob(work)).toBeInstanceOf(WorkerJob);
  });

  it('should produce MainThreadJobs when Workers are unavailable', () => {
    withoutWorkers();

    expect(JobFactory.getJob(work)).toBeInstanceOf(MainThreadJob);
  });
});
