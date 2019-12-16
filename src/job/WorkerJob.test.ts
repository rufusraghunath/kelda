import WorkerJob from "./WorkerJob";
import MockBlob from "../dom-mocks/MockBlob";
import MockURL from "../dom-mocks/MockURL";
import MockWorker from "../dom-mocks/MockWorker";

describe("WorkerJob", () => {
  const work = () => 1 + 1;
  const errorWork = () => {
    throw new Error("The work failed");
  };

  window.Worker = MockWorker as any;
  window.URL = MockURL as any;
  window.Blob = MockBlob as any;

  it("should schedule work on a Web Worker", async () => {
    const job = new WorkerJob(work);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it("should reject when something goes wrong during Worker initialization", async () => {
    MockWorker.failNextConstruction();

    try {
      await new WorkerJob(work).execute();
    } catch (e) {
      expect(e).toEqual(new Error("Worker initialization failed!"));
    }
  });

  it("should reject when Worker an error is thrown while executing work", async () => {
    try {
      await new WorkerJob(errorWork).execute();
    } catch (e) {
      expect(e).toEqual(new Error("The work failed"));
    }
    // TODO: await expect(new WorkerJob(work).execute()).rejects.toEqual(new Error("The work failed"))
  });

  xit("starting work should be idempotent", () => {
    // TODO: how to test this?
  });

  it("sets 'isDone' to true after completing work", async () => {
    const job = new WorkerJob(work);

    expect(job.isDone).toBe(false);

    const workPromise = job.execute();

    expect(job.isDone).toBe(false);

    await workPromise;

    expect(job.isDone).toBe(true);
  });

  it("sets 'isDone' to true when failing to complete work", async () => {
    const job = new WorkerJob(errorWork);

    expect(job.isDone).toBe(false);

    const workPromise = job.execute();

    expect(job.isDone).toBe(false);

    try {
      await workPromise;
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });
});
