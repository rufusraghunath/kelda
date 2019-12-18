import Kelda from "./Kelda";
import { work, withoutWorkers, errorWork } from "./util/testUtils";
import KeldaError from "./KeldaError";

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

  it("propagates work errors as KeldaErrors", async () => {
    const kelda = new Kelda();

    await expect(kelda.orderWork(errorWork)).rejects.toEqual(
      new KeldaError("The work failed")
    );
  });

  it("sets a default error message when none is available", async () => {
    const errorWorkWithoutMessage = () => {
      throw new Error();
    };

    const kelda = new Kelda();

    await expect(kelda.orderWork(errorWorkWithoutMessage)).rejects.toEqual(
      new KeldaError("Something went wrong while processing work")
    );
  });
});
