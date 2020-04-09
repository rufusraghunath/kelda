import xhr from 'xhr-mock';
import fs from 'fs';
import path from 'path';
import WorkLoader, { WorkLoadingStatus } from './WorkLoader';
import KeldaError from './KeldaError';

describe('WorkLoader', () => {
  const numberUrl = '/path/to/number/script';
  const numberScript = fs
    .readFileSync(path.join(__dirname, 'testScript.number.js'))
    .toString();

  beforeEach(() => {
    xhr.setup();
  });

  afterEach(() => {
    xhr.teardown();
  });

  describe('eager loading', () => {
    it('eagerly fetches work from script', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const loader = new WorkLoader(numberUrl);

      expect(loader.status).toBe(WorkLoadingStatus.IN_PROGRESS);

      const work = await loader.get();

      expect(loader.status).toBe(WorkLoadingStatus.DONE);
      expect(work()).toBe(30);
    });

    it('throws when status is 400', async () => {
      xhr.get(numberUrl, (_, res) => res.status(400));

      const loader = new WorkLoader(numberUrl);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws when status is 500', async () => {
      xhr.get(numberUrl, (_, res) => res.status(500));

      const loader = new WorkLoader(numberUrl);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws if script does not return a function', async () => {
      const brokenScript = 'return false;';

      xhr.get(numberUrl, (_, res) => res.status(200).body(brokenScript));

      const loader = new WorkLoader(numberUrl);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError(
          "Script did not return a work function: '/path/to/number/script'"
        )
      );
    });
  });

  describe('lazy loading', () => {
    it('lazily fetches work from script', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const loader = new WorkLoader(numberUrl, true);

      expect(loader.status).toBe(WorkLoadingStatus.NOT_STARTED);

      const work = await loader.get();

      expect(loader.status).toBe(WorkLoadingStatus.DONE);
      expect(work()).toBe(30);
    });

    it('throws when status is 400', async () => {
      xhr.get(numberUrl, (_, res) => res.status(400));

      const loader = new WorkLoader(numberUrl, true);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws when status is 500', async () => {
      xhr.get(numberUrl, (_, res) => res.status(500));

      const loader = new WorkLoader(numberUrl, true);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws if script does not return a function', async () => {
      const brokenScript = 'return false;';

      xhr.get(numberUrl, (_, res) => res.status(200).body(brokenScript));

      const loader = new WorkLoader(numberUrl, true);

      await expect(loader.get()).rejects.toEqual(
        new KeldaError(
          "Script did not return a work function: '/path/to/number/script'"
        )
      );
    });
  });
});
