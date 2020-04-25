import JobFactory from './JobFactory';
import WorkerJob from './WorkerJob';
import MainThreadJob from './MainThreadJob';
import { work, withoutWorkers } from '../util/test/testUtils';
import LocalWorkModule from '../work/LocalWorkModule';

describe('JobFactory', () => {
  const workModule = new LocalWorkModule(work);

  it('should produce WorkerJobs when Workers are available', () => {
    expect(JobFactory.getJob(workModule)).toBeInstanceOf(WorkerJob);
  });

  it('should produce MainThreadJobs when Workers are unavailable', () => {
    withoutWorkers();

    expect(JobFactory.getJob(workModule)).toBeInstanceOf(MainThreadJob);
  });
});
