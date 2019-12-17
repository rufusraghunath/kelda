import Kelda from "./Kelda";

describe("Kelda", () => {
  const work = () => 1 + 1;

  xit("sets sensible defaults if no options are specified", () => {
    // TODO
  });

  it("can take orders for work when Workers are available", async () => {
    const kelda = new Kelda();
    const result = await kelda.orderWork(work);

    expect(result).toBe(2);
  });

  xit("can take orders for work when Workers are unavailable", async () => {
    // TODO
  });

  xit("can take multiple orders and complete them as threads open up", () => {
    // TODO
  });
});
