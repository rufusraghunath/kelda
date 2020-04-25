import fs from 'fs';
import path from 'path';
import RemoteWorkModule from './RemoteWorkModule';

describe('WorkContainer', () => {
  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();

  const remoteWorkModule = new RemoteWorkModule(numberScript, 'default');

  it('evals the script and returns the work for MainThreadJobs', () => {
    const work = remoteWorkModule.get();

    expect(work()).toBe(30);
  });

  it('provides a custom .toString() for WorkerJobs', () => {
    const expected = `(function() {
      return ${numberScript}
    })()["default"]`;

    expect(`${remoteWorkModule}`).toBe(expected);
  });
});
