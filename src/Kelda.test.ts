import Kelda from "./Kelda";
import { work, withoutWorkers } from "./util/testUtils";

describe("Kelda", () => {
  it("can take orders for work when Workers are available", async () => {
    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  it("can take orders for work when Workers are unavailable", async () => {
    withoutWorkers();

    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  it("can take multiple orders", async () => {
    const kelda = new Kelda({ threadPoolDepth: 3 });
    const workPromises: Promise<any>[] = [];

    Array(10)
      .fill(null)
      .forEach(() => kelda.orderWork(work));

    workPromises.forEach(
      async workPromise => await expect(workPromise).resolves.toBe(2)
    );
  });
});
