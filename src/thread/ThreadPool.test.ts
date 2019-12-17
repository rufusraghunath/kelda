import ThreadPool from "./ThreadPool";
import MainThreadJob from "../job/MainThreadJob";
import { work, oneSecondWork, flushPromises } from "../util/testUtils";

describe("ThreadPool", () => {
  describe("validating", () => {
    it("should throw if threadPoolDepth is 0", () => {
      expect(() => new ThreadPool(0)).toThrowError(
        "KeldaError: threadPoolDepth must be greater than 0"
      );
    });

    it("should throw if threadPoolDepth is <0", () => {
      expect(() => new ThreadPool(-1)).toThrowError(
        "KeldaError: threadPoolDepth must be greater than 0"
      );
    });
  });

  describe("scheduling Jobs", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("can schedule jobs to be completed", async () => {
      const threadPool = new ThreadPool(1);
      const job = new MainThreadJob(work);

      await expect(threadPool.schedule(job)).resolves.toBe(2);
    });

    it("should only run one Job at a time when threadPoolDepth is 1", async () => {
      const threadPool = new ThreadPool(1);
      const job1 = new MainThreadJob(oneSecondWork);
      const job2 = new MainThreadJob(oneSecondWork);

      threadPool.schedule(job1);
      threadPool.schedule(job2);

      expect(job1.isDone).toBe(false);
      expect(job2.isDone).toBe(false);

      jest.advanceTimersByTime(1000);

      await flushPromises();

      expect(job1.isDone).toBe(true);
      expect(job2.isDone).toBe(false);
    });

    it("should only run two Jobs at a time when threadPoolDepth is 2", async () => {
      const threadPool = new ThreadPool(2);
      const job1 = new MainThreadJob(oneSecondWork);
      const job2 = new MainThreadJob(oneSecondWork);
      const job3 = new MainThreadJob(oneSecondWork);

      threadPool.schedule(job1);
      threadPool.schedule(job2);
      threadPool.schedule(job3);

      expect(job1.isDone).toBe(false);
      expect(job2.isDone).toBe(false);
      expect(job3.isDone).toBe(false);

      jest.advanceTimersByTime(1000);

      await flushPromises();

      expect(job1.isDone).toBe(true);
      expect(job2.isDone).toBe(true);
      expect(job3.isDone).toBe(false);
    });

    it("enqueues Jobs and runs them once the threadPool has capacity", async () => {
      const threadPool = new ThreadPool(2);
      const job1 = new MainThreadJob(oneSecondWork);
      const job2 = new MainThreadJob(oneSecondWork);
      const job3 = new MainThreadJob(oneSecondWork);

      threadPool.schedule(job1);
      threadPool.schedule(job2);
      threadPool.schedule(job3);

      jest.advanceTimersByTime(1000);

      await flushPromises();

      jest.advanceTimersByTime(1000);

      await flushPromises();

      expect(job3.isDone).toBe(true);
    });

    it("can run multiple jobs from queue - first in, first out", async () => {
      const threadPool = new ThreadPool(1);
      const job1 = new MainThreadJob(oneSecondWork);
      const job2 = new MainThreadJob(oneSecondWork);
      const job3 = new MainThreadJob(oneSecondWork);

      threadPool.schedule(job1);
      threadPool.schedule(job2);
      threadPool.schedule(job3);

      jest.advanceTimersByTime(1000);

      await flushPromises();

      jest.advanceTimersByTime(1000);

      await flushPromises();

      expect(job2.isDone).toBe(true);
      expect(job3.isDone).toBe(false);

      jest.advanceTimersByTime(1000);

      await flushPromises();

      expect(job3.isDone).toBe(true);
    });
  });
});
