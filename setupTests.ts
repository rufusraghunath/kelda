import { withWorkers, withoutWorkers } from "./src/util/testUtils";
import MockURL from "./src/dom-mocks/MockURL";

beforeEach(() => {
  withWorkers();
  MockURL.revokeObjectURL.mockReset();
});

afterEach(() => {
  withoutWorkers();
});
