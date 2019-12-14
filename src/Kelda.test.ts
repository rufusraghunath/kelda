import Kelda from "./Kelda";

describe("Kelda", () => {
  it("should take orders for synchronous work", async () => {
    const work = () => 1 + 1;
    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  it("should take orders for asynchronous work", async () => {
    const work = () =>
      new Promise(resolve => setTimeout(() => resolve(2), 100));
    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });
});
