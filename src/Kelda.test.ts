import Kelda from "./Kelda";

describe("Kelda", () => {
  it("should throw if threadPoolDepth is 0", () => {
    expect(() => new Kelda(0)).toThrowError(
      "Error constructing Kelda: threadPoolDepth must be greater than 0"
    );
  });

  it("should throw if threadPoolDepth is <0", () => {
    expect(() => new Kelda(-1)).toThrowError(
      "Error constructing Kelda: threadPoolDepth must be greater than 0"
    );
  });

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
