import MainThreadJob from './MainThreadJob';
import {
  oneSecondWork,
  work,
  errorWork,
  withoutWorkers
} from '../util/testUtils';

describe('SyncJob', () => {
  beforeEach(() => {
    withoutWorkers();
  });

  it('does synchronous work in the main JS thread', async () => {
    const job = new MainThreadJob(work);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it('does asynchronous work in the main JS thread', async () => {
    const job = new MainThreadJob(oneSecondWork);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it('should reject when an error is thrown while executing work', async () => {
    await expect(new MainThreadJob(errorWork).execute()).rejects.toEqual(
      new Error('The work failed')
    );
  });

  it("sets 'isDone' to true after completing work", async () => {
    const job = new MainThreadJob(work);

    expect(job.isDone).toBe(false);

    await job.execute();

    expect(job.isDone).toBe(true);
  });

  it("sets 'isDone' to true when failing to complete work", async () => {
    const job = new MainThreadJob(errorWork);

    expect(job.isDone).toBe(false);

    try {
      await job.execute();
      throw new Error('The work should have failed!');
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });
});
