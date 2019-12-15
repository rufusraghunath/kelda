import WorkerJob from "./WorkerJob";
import MockWorker from "./dom-mocks/MockWorker";

describe("WorkerJob", () => {
  const syncWork = () => 1 + 1;

  // Need to assert interactions with Worker API?

  window.Worker = MockWorker as any;

  it("should schedule work on a Web Worker", async () => {
    const job = new WorkerJob(syncWork);
    const result = await job.execute();

    expect(result).toBe(2);
  });

  xit("should reject when Worker construction fails", () => {
    //
  });

  it("should reject when Worker an error is thrown while executing work", done => {
    const errorWork = () => {
      throw new Error("The work failed");
    };

    new WorkerJob(errorWork)
      .execute()
      .catch(e => expect(e).toEqual(new Error("The work failed")))
      .then(done);
  });

  xit("starting work should be idempotent", () => {
    //
  });
});
