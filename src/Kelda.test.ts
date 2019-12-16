import Kelda from "./Kelda";
import MockWorker from "./dom-mocks/MockWorker";
import MockURL from "./dom-mocks/MockURL";
import MockBlob from "./dom-mocks/MockBlob";

describe("Kelda", () => {
  const work = () => 1 + 1;
  const timedWork = () =>
    new Promise(resolve => setTimeout(() => resolve(2), 1000));

  it("should throw if threadPoolDepth is 0", () => {
    expect(() => new Kelda({ threadPoolDepth: 0 })).toThrowError(
      "KeldaError: threadPoolDepth must be greater than 0"
    );
  });

  it("should throw if threadPoolDepth is <0", () => {
    expect(() => new Kelda({ threadPoolDepth: -1 })).toThrowError(
      "KeldaError: threadPoolDepth must be greater than 0"
    );
  });

  describe("Running MainThreadJobs", () => {
    it("should take orders for synchronous work", async () => {
      const kelda = new Kelda();
      const result = await kelda.orderWork(work);

      expect(result).toBe(2);
    });

    it("should take orders for asynchronous work", async () => {
      const kelda = new Kelda();
      const result = await kelda.orderWork(timedWork);

      expect(result).toBe(2);
    });

    xit("should do something with the queue?", () => {
      // what exactly should happen with mainthreadjobs?
    });
  });

  // TODO: tests for default options

  describe("Running WorkerJobs", () => {
    // TODO: extract all of this stuff
    window.Worker = MockWorker as any;
    window.URL = MockURL as any;
    window.Blob = MockBlob as any;

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    xit("should only run one Job at a time when threadPoolDepth is 1", () => {
      //
    });

    xit("should only run two Jobs at a time when threadPoolDepth is 2", () => {
      //
    });

    xit("Enqueues Jobs and runs them once the threadPool has capacity", () => {
      //
    });
  });
});
