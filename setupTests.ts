import { withWorkers, withoutWorkers } from "./src/util/testUtils";

beforeEach(() => {
  withWorkers();
});

afterEach(() => {
  withoutWorkers();
});
