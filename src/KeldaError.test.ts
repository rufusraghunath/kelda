import KeldaError from "./KeldaError";

describe("KeldaError", () => {
  it("should be instanceof Error", () => {
    expect(new KeldaError("Oops")).toBeInstanceOf(Error);
  });

  it("should have error message", () => {
    expect(new KeldaError("Oops").message).toBe("Oops");
  });

  it("should have name KeldaError", () => {
    expect(new KeldaError("Oops").name).toBe("KeldaError");
  });
});
