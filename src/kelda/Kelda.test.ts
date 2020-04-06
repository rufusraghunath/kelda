import Kelda from './Kelda';
import { work, withoutWorkers, errorWork } from '../util/testUtils';
import KeldaError from './KeldaError';
import xhr from 'xhr-mock';
import fs from 'fs';
import path from 'path';

describe('Kelda', () => {
  it('can take multiple orders', async () => {
    const kelda = new Kelda({ threadPoolDepth: 3 });
    const workPromises: Promise<number>[] = [];

    Array(10)
      .fill(null)
      .forEach(() => kelda.orderWork(work));

    workPromises.forEach(
      async workPromise => await expect(workPromise).resolves.toBe(2)
    );
  });

  describe('can process functions as work', () => {
    it('when Workers are available', async () => {
      const kelda = new Kelda();
      const result = await kelda.orderWork(work);

      expect(result).toBe(2);
    });

    it('when Workers are unavailable', async () => {
      withoutWorkers();

      const kelda = new Kelda();
      const result = await kelda.orderWork(work);

      expect(result).toBe(2);
    });
  });

  describe('loading work from script url', () => {
    const url = '/path/to/script';
    const script = fs
      .readFileSync(path.join(__dirname, 'testScript.js'))
      .toString();

    beforeEach(() => {
      xhr.setup();
    });

    afterEach(() => {
      xhr.teardown();
    });

    it('when Workers are available', async () => {
      xhr.get(url, (_, res) => res.status(200).body(script));

      const kelda = new Kelda();
      const result = await kelda.orderWork(url);

      expect(result).toBe(30);
    });

    it('when Workers are unavailable', async () => {
      xhr.get(url, (_, res) => res.status(200).body(script));
      withoutWorkers();

      const kelda = new Kelda();
      const result = await kelda.orderWork(url);

      expect(result).toBe(30);
    });

    it('throws when status is 400', async () => {
      xhr.get(url, (_, res) => res.status(400));

      const kelda = new Kelda();

      await expect(kelda.orderWork(url)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/script'")
      );
    });

    it('throws when status is 500', async () => {
      xhr.get(url, (_, res) => res.status(500));

      const kelda = new Kelda();

      await expect(kelda.orderWork(url)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/script'")
      );
    });

    it('throws if script does not return a function', async () => {
      const brokenScript = 'return false;';

      xhr.get(url, (_, res) => res.status(200).body(brokenScript));

      const kelda = new Kelda();

      await expect(kelda.orderWork(url)).rejects.toEqual(
        new KeldaError(
          "Script did not return a work function: '/path/to/script'"
        )
      );
    });
  });

  describe('error handling', () => {
    it('propagates work errors as KeldaErrors', async () => {
      const kelda = new Kelda();

      await expect(kelda.orderWork(errorWork)).rejects.toEqual(
        new KeldaError('The work failed')
      );
    });

    it('sets a default error message when none is available', async () => {
      const errorWorkWithoutMessage = () => {
        throw new Error();
      };

      const kelda = new Kelda();

      await expect(kelda.orderWork(errorWorkWithoutMessage)).rejects.toEqual(
        new KeldaError('Something went wrong while processing work')
      );
    });
  });
});
