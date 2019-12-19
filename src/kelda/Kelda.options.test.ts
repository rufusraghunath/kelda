/*
  These tests are in a separate module because Jest makes it surprisingly hard
  To mock a class constructor *only sometimes* in the same test file.
*/

import Kelda from "./Kelda";
import ThreadPool from "../thread/ThreadPool";

jest.mock("../thread/ThreadPool");

describe("Kelda options", () => {
  it("sets sensible defaults if no options are specified", () => {
    new Kelda();

    expect(ThreadPool).toHaveBeenCalledWith(1);
  });

  it("can accept custom config", () => {
    new Kelda({ threadPoolDepth: 3 });

    expect(ThreadPool).toHaveBeenCalledWith(3);
  });
});
