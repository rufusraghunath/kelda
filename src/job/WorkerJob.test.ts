import WorkerJob from "./WorkerJob";
import MockWorker from "../dom-mocks/MockWorker";
import { work, errorWork } from "../util/testUtils";
import MockURL, { getActiveUrls } from "../dom-mocks/MockURL";

xdescribe("WorkerJob", () => {
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

  it("revokes objectURL when work completes successfully", async () => {
    const workPromise = new WorkerJob(work).execute();

    expect(MockURL.revokeObjectURL).not.toHaveBeenCalled();

    await workPromise;

    const revokedUrl = MockURL.revokeObjectURL.mock.calls[0][0];
    const activeUrls = Object.keys(getActiveUrls());

    expect(activeUrls).toContain(revokedUrl);
  });

  it("revokes objectURL when work fails to complete successfully", async () => {
    const workPromise = new WorkerJob(work).execute();

    expect(MockURL.revokeObjectURL).not.toHaveBeenCalled();

    try {
      await workPromise;
    } catch (e) {
      const revokedUrl = MockURL.revokeObjectURL.mock.calls[0][0];
      const activeUrls = Object.keys(getActiveUrls());

      expect(activeUrls).toContain(revokedUrl);
    }
  });

  it("kills the Worker when the work is done", async () => {
    const workPromise = new WorkerJob(work).execute();

    expect(MockWorker.wasTerminated).toBe(false);

    await workPromise;

    expect(MockWorker.wasTerminated).toBe(true);
  });

  it("kills the Worker when the work has errored", async () => {
    const workPromise = new WorkerJob(work).execute();

    expect(MockWorker.wasTerminated).toBe(false);

    try {
      await workPromise;
    } catch (e) {
      expect(MockWorker.wasTerminated).toBe(true);
    }
  });
});
