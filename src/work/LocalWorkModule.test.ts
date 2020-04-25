import LocalWorkModule from './LocalWorkModule';
import { work } from '../util/test/testUtils';

describe('LocalWorkModule', () => {
  const localWorkModule = new LocalWorkModule(work);

  it('returns work function passed to it for MainThreadJobs', () => {
    expect(localWorkModule.get()).toBe(work);
  });

  it('provides a custom .toString() for WorkerJobs', () => {
    expect(`${localWorkModule}`).toBe(work.toString());
  });
});
