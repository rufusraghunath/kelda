import MainThreadJob from "./MainThreadJob";

describe("SyncJob", () => {
  const syncWork = () => 1 + 1;
  const errorWork = () => {
    throw new Error("The work failed");
  };

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

  it("should reject when an error is thrown while executing work", async () => {
    try {
      await new MainThreadJob(errorWork).execute();
    } catch (e) {
      expect(e).toEqual(new Error("The work failed"));
    }
  });

  it("sets 'isDone' to true after completing work", async () => {
    const job = new MainThreadJob(syncWork);

    expect(job.isDone).toBe(false);

    await job.execute();

    expect(job.isDone).toBe(true);
  });

  it("sets 'isDone' to true when failing to complete work", async () => {
    const job = new MainThreadJob(errorWork);

    expect(job.isDone).toBe(false);

    try {
      await job.execute();
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });
});
