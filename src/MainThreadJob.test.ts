import MainThreadJob from "./MainThreadJob";

describe("SyncJob", () => {
  const syncWork = () => 1 + 1;

  // Need to assert no kind of interactions with Worker API?

  it("does synchronous work in the main JS thread", async () => {
    const job = new MainThreadJob(syncWork);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it("does asynchronous work in the main JS thread", async () => {
    const asyncWork = () =>
      new Promise(resolve => setTimeout(() => resolve(2), 100));
    const job = new MainThreadJob(asyncWork);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it("sets 'isDone' to true after completing work", async () => {
    const job = new MainThreadJob(syncWork);

    expect(job.isDone).toBe(false);

    await job.execute();

    expect(job.isDone).toBe(true);
  });
});
