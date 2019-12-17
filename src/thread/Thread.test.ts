import MainThreadJob from "../job/MainThreadJob";
import Thread from "./Thread";
import { work, oneSecondWork, errorWork } from "../util/testUtils";

describe("Thread", () => {
  it("can execute sync Jobs", async () => {
    const thread = new Thread();
    const job = new MainThreadJob(work);

    await expect(thread.do(job)).resolves.toBe(2);
  });

  it("can execute async Jobs", async () => {
    const thread = new Thread();
    const job = new MainThreadJob(oneSecondWork);

    await expect(thread.do(job)).resolves.toBe(2);
  });

  it("handles Job failures", async () => {
    const thread = new Thread();
    const job = new MainThreadJob(errorWork);

    await expect(thread.do(job)).rejects.toEqual(new Error("The work failed"));
  });

  it("initially sets 'isIdle' to true", () => {
    const thread = new Thread();

    expect(thread.isIdle).toBe(true);
  });

  it("sets 'isIdle' to false during work", () => {
    const thread = new Thread();
    const job = new MainThreadJob(work);

    thread.do(job);

    expect(thread.isIdle).toBe(false);
  });

  it("resets 'isIdle' to true after work", async () => {
    const thread = new Thread();
    const job = new MainThreadJob(work);

    await thread.do(job);

    expect(thread.isIdle).toBe(true);
  });
});
