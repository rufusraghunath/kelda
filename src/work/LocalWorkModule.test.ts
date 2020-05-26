import LocalWorkModule from './LocalWorkModule';
import { work } from '../util/test/testUtils';

describe('LocalWorkModule', () => {
  const localWorkModule = new LocalWorkModule(work);

  it('returns work function passed to it for MainThreadJobs', () => {
    expect(localWorkModule.get()).toBe(work);
  });

  it('provides a custom .toString() that wraps work in a module for WorkerJobs', () => {
    expect(`${localWorkModule}`).toBe(`function(){
      return {
        default: ${work.toString()}
      }
    }`);
  });

  it('always returns "default" as exportName', () => {
    expect(localWorkModule.exportName).toBe('default');
  });
});
