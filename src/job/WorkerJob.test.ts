import WorkerJob from "./WorkerJob";
import MockWorker from "../dom-mocks/MockWorker";
import { work, errorWork } from "../util/testUtils";

describe("WorkerJob", () => {
  it("should schedule work on a Web Worker", async () => {
    const job = new WorkerJob(work);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  it("should reject when something goes wrong during Worker initialization", async () => {
    MockWorker.failNextConstruction();

    await expect(new WorkerJob(work).execute()).rejects.toEqual(
      new Error("Worker initialization failed!")
    );
  });

  it("should reject when Worker an error is thrown while executing work", async () => {
    await expect(new WorkerJob(errorWork).execute()).rejects.toEqual(
      new Error("The work failed")
    );
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
      throw new Error("Work should have failed!");
    } catch (e) {
      expect(job.isDone).toBe(true);
    }
  });
});
