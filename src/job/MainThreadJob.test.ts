import fs from 'fs';
import path from 'path';
import MainThreadJob from './MainThreadJob';
import LocalWorkModule from '../work/LocalWorkModule';
import {
  oneSecondWork,
  work,
  errorWork,
  withoutWorkers,
  addWork
} from '../util/test/testUtils';
import RemoteWorkModule from '../work/RemoteWorkModule';

describe('MainThreadJob', () => {
  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();

  const typesScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/types.js'))
    .toString();

  beforeEach(() => {
    withoutWorkers();
  });

  it('does synchronous work in the main JS thread', async () => {
    const workModule = new LocalWorkModule(work);
    const job = new MainThreadJob(workModule);

    const result = await job.execute();

    expect(result).toBe(2);
  });

  it('does asynchronous work in the main JS thread', async () => {
    const workModule = new LocalWorkModule(oneSecondWork);
    const job = new MainThreadJob(workModule);

    const result = await job.execute();

    expect(result).toBe(2);
  });

  it('works with remote work modules', async () => {
    const workModule = new RemoteWorkModule(numberScript, 'default');
    const job = new MainThreadJob(workModule);

    const result = await job.execute();

    expect(result).toBe(30);
  });

  it('can apply args to work', async () => {
    const workModule = new LocalWorkModule(addWork);
    const job = new MainThreadJob(workModule).with([1, 2]);

    const result = await job.execute();

    expect(result).toBe(3);
  });

  it('can apply various types of args to work', async () => {
    const workModule = new RemoteWorkModule(typesScript, 'default');
    const job = new MainThreadJob(workModule).with([
      1,
      [],
      [1, 2, 3],
      {},
      { hello: 'world' }
    ]);

    const result = await job.execute();

    expect(result).toBe(true);
  });

  it('should reject when an error is thrown while executing work', async () => {
    const workModule = new LocalWorkModule(errorWork);

    await expect(new MainThreadJob(workModule).execute()).rejects.toEqual(
      new Error('The work failed')
    );
  });

  it("sets 'isDone' to true after completing work", async () => {
    const workModule = new LocalWorkModule(work);
    const job = new MainThreadJob(workModule);

    expect(job.isDone).toBe(false);

    await job.execute();

    expect(job.isDone).toBe(true);
  });

  it("sets 'isDone' to true when failing to complete work", async () => {
    const workModule = new LocalWorkModule(errorWork);
    const job = new MainThreadJob(workModule);

    expect(job.isDone).toBe(false);

    try {
      await job.execute();
      throw new Error('The work should have failed!');
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });
});
