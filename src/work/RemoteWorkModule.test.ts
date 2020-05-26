import fs from 'fs';
import path from 'path';
import RemoteWorkModule from './RemoteWorkModule';

describe('RemoteWorkModule', () => {
  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();

  const remoteWorkModule = new RemoteWorkModule(numberScript, 'default');

  it('evals the script and returns the work for MainThreadJobs', () => {
    const work = remoteWorkModule.get();

    expect(work()).toBe(30);
  });

  it('provides a custom .toString() that returns the remote module for WorkerJobs', () => {
    const expected = `function(){
      return ${numberScript}
    }`;

    expect(`${remoteWorkModule}`).toBe(expected);
  });

  it('returns exportName passed to it in constructor', () => {
    expect(remoteWorkModule.exportName).toBe('default');
    expect(new RemoteWorkModule(numberScript, 'someName').exportName).toBe(
      'someName'
    );
  });
});
