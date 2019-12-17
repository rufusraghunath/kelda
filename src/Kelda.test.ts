import Kelda from "./Kelda";
import MockWorker from "./dom-mocks/MockWorker";
import MockBlob from "./dom-mocks/MockBlob";
import MockURL from "./dom-mocks/MockURL";

describe("Kelda", () => {
  const work = () => 1 + 1;

  it("can take orders for work when Workers are available", async () => {
    window.Worker = MockWorker as any;
    window.Blob = MockBlob as any;
    window.URL = MockURL as any;

    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  it("can take orders for work when Workers are unavailable", async () => {
    delete window.Worker;
    delete window.Blob;
    delete window.URL;

    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  it("can take multiple orders", async () => {
    window.Worker = MockWorker as any;
    window.Blob = MockBlob as any;
    window.URL = MockURL as any;

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
