import JobFactory from "./JobFactory";
import WorkerJob from "./WorkerJob";
import MainThreadJob from "./MainThreadJob";
import MockWorker from "../dom-mocks/MockWorker";
import MockURL from "../dom-mocks/MockURL";
import MockBlob from "../dom-mocks/MockBlob";

describe("JobFactory", () => {
  const work = () => 1 + 1;

  it("should produce WorkerJobs when Workers are available", () => {
    window.Worker = MockWorker as any;
    window.URL = MockURL as any;
    window.Blob = MockBlob as any;

    expect(JobFactory.getJob(work)).toBeInstanceOf(WorkerJob);

    delete window.Worker;
    delete window.URL;
    delete window.Blob;
  });

  it("should produce MainThreadJobs when Workers are unavailable", () => {
    expect(JobFactory.getJob(work)).toBeInstanceOf(MainThreadJob);
  });
});
