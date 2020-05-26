import fs from 'fs';
import path from 'path';
import WorkerJob from './WorkerJob';
import MockWorker from '../dom-mocks/MockWorker';
import { work, errorWork, addWork } from '../util/test/testUtils';
import MockURL, { getActiveUrls } from '../dom-mocks/MockURL';
import LocalWorkModule from '../work/LocalWorkModule';
import RemoteWorkModule from '../work/RemoteWorkModule';

describe('WorkerJob', () => {
  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();
  const namedScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/named.js'))
    .toString();

  it('should schedule work on a Web Worker', async () => {
    const workModule = new LocalWorkModule(work);
    const job = new WorkerJob(workModule);

    const result = await job.execute();

    expect(result).toBe(2);
  });

  it('works with remote work modules', async () => {
    const workModule = new RemoteWorkModule(numberScript, 'default');
    const job = new WorkerJob(workModule);

    const result = await job.execute();

    expect(result).toBe(30);
  });

  it('can apply args to work', async () => {
    const workModule = new LocalWorkModule(addWork);
    const job = new WorkerJob(workModule).with(1, 2);

    const result = await job.execute();

    expect(result).toBe(3);
  });

  it('can handle named exports', async () => {
    const workModule = new RemoteWorkModule(namedScript, 'add');
    const job = new WorkerJob(workModule).with(8, 2);

    const result = await job.execute();

    expect(result).toBe(10);
  });

  it('should reject when something goes wrong during Worker initialization', async () => {
    MockWorker.failNextConstruction();

    const workModule = new LocalWorkModule(work);

    await expect(new WorkerJob(workModule).execute()).rejects.toEqual(
      new Error('Worker initialization failed!')
    );
  });

  it('should reject when an error is thrown while executing work', async () => {
    const workModule = new LocalWorkModule(errorWork);

    await expect(new WorkerJob(workModule).execute()).rejects.toEqual(
      new Error('The work failed')
    );
  });

  it('should reject when work script is not a module', async () => {
    const workModule = new RemoteWorkModule('false', 'default');

    await expect(new WorkerJob(workModule).execute()).rejects.toEqual(
      new Error('Provided work script did not evaluate to a module object')
    );
  });

  it('should reject when an invalid exportName is provided', async () => {
    const workModule = new RemoteWorkModule(numberScript, 'invalidExportName');

    await expect(new WorkerJob(workModule).execute()).rejects.toEqual(
      new Error(
        "Export 'invalidExportName' was not found in provided work module"
      )
    );
  });

  it("sets 'isDone' to true after completing work", async () => {
    const workModule = new LocalWorkModule(work);
    const job = new WorkerJob(workModule);

    expect(job.isDone).toBe(false);

    const workPromise = job.execute();

    expect(job.isDone).toBe(false);

    await workPromise;

    expect(job.isDone).toBe(true);
  });

  it("sets 'isDone' to true when failing to complete work", async () => {
    const workModule = new LocalWorkModule(errorWork);
    const job = new WorkerJob(workModule);

    expect(job.isDone).toBe(false);

    const workPromise = job.execute();

    expect(job.isDone).toBe(false);

    try {
      await workPromise;
      throw new Error('Work should have failed!');
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });

  it('revokes objectURL when work completes successfully', async () => {
    const workModule = new LocalWorkModule(work);
    const workPromise = new WorkerJob(workModule).execute();

    expect(MockURL.revokeObjectURL).not.toHaveBeenCalled();

    await workPromise;

    const revokedUrl = MockURL.revokeObjectURL.mock.calls[0][0];
    const activeUrls = Object.keys(getActiveUrls());

    expect(activeUrls).toContain(revokedUrl);
  });

  it('revokes objectURL when work fails to complete successfully', async () => {
    const workModule = new LocalWorkModule(work);
    const workPromise = new WorkerJob(workModule).execute();

    expect(MockURL.revokeObjectURL).not.toHaveBeenCalled();

    try {
      await workPromise;
    } catch (e) {
      const revokedUrl = MockURL.revokeObjectURL.mock.calls[0][0];
      const activeUrls = Object.keys(getActiveUrls());

      expect(activeUrls).toContain(revokedUrl);
    }
  });

  it('kills the Worker when the work is done', async () => {
    const workModule = new LocalWorkModule(work);
    const workPromise = new WorkerJob(workModule).execute();

    expect(MockWorker.wasTerminated).toBe(false);

    await workPromise;

    expect(MockWorker.wasTerminated).toBe(true);
  });

  it('kills the Worker when the work has errored', async () => {
    const workModule = new LocalWorkModule(work);
    const workPromise = new WorkerJob(workModule).execute();

    expect(MockWorker.wasTerminated).toBe(false);

    try {
      await workPromise;
    } catch (e) {
      expect(MockWorker.wasTerminated).toBe(true);
    }
  });
});
