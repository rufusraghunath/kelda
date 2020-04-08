import Kelda from './Kelda';
import { work, withoutWorkers, errorWork } from '../util/testUtils';
import KeldaError from './KeldaError';
import xhr from 'xhr-mock';
import fs from 'fs';
import path from 'path';

describe('Kelda', () => {
  const numberUrl = '/path/to/number/script';
  const stringUrl = '/path/to/string/script';
  const booleanUrl = '/path/to/boolean/script';
  const numberScript = fs
    .readFileSync(path.join(__dirname, 'testScript.number.js'))
    .toString();
  const stringScript = fs
    .readFileSync(path.join(__dirname, 'testScript.string.js'))
    .toString();
  const booleanScript = fs
    .readFileSync(path.join(__dirname, 'testScript.boolean.js'))
    .toString();

  beforeEach(() => {
    xhr.setup();
  });

  afterEach(() => {
    xhr.teardown();
  });

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

  describe('executing work from script url', () => {
    it('when Workers are available', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const result = await kelda.orderWork(numberUrl);

      expect(result).toBe(30);
    });

    it('when Workers are unavailable', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));
      withoutWorkers();

      const kelda = new Kelda();
      const result = await kelda.orderWork(numberUrl);

      expect(result).toBe(30);
    });

    it('throws when status is 400', async () => {
      xhr.get(numberUrl, (_, res) => res.status(400));

      const kelda = new Kelda();

      await expect(kelda.orderWork(numberUrl)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws when status is 500', async () => {
      xhr.get(numberUrl, (_, res) => res.status(500));

      const kelda = new Kelda();

      await expect(kelda.orderWork(numberUrl)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws if script does not return a function', async () => {
      const brokenScript = 'return false;';

      xhr.get(numberUrl, (_, res) => res.status(200).body(brokenScript));

      const kelda = new Kelda();

      await expect(kelda.orderWork(numberUrl)).rejects.toEqual(
        new KeldaError(
          "Script did not return a work function: '/path/to/number/script'"
        )
      );
    });
  });

  describe('eager loading work for later use', () => {
    it('should provide work id for a given script', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const id = await kelda.load(numberUrl);

      expect(id).toEqual(expect.any(Number));
    });

    it('should execute work for given work id', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const id = await kelda.load(numberUrl);
      const result = await kelda.orderWork(id);

      expect(result).toBe(30);
    });

    it('can load and execute multiple work functions', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));
      xhr.get(stringUrl, (_, res) => res.status(200).body(stringScript));
      xhr.get(booleanUrl, (_, res) => res.status(200).body(booleanScript));

      const kelda = new Kelda();
      const id1 = await kelda.load(numberUrl);
      const id2 = await kelda.load(stringUrl);
      const id3 = await kelda.load(booleanUrl);
      const result1 = await kelda.orderWork(id1);
      const result2 = await kelda.orderWork(id2);
      const result3 = await kelda.orderWork(id3);

      expect(result1).toBe(30);
      expect(result2).toBe('aabb');
      expect(result3).toBe(true);
    });

    it('should execute work for given work id', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const invalidId = 99;

      await expect(kelda.orderWork(invalidId)).rejects.toEqual(
        new KeldaError("Invalid work id: '99'")
      );
    });

    it('throws when status is 400', async () => {
      xhr.get(numberUrl, (_, res) => res.status(400));

      const kelda = new Kelda();

      await expect(kelda.load(numberUrl)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws when status is 500', async () => {
      xhr.get(numberUrl, (_, res) => res.status(500));

      const kelda = new Kelda();

      await expect(kelda.load(numberUrl)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });

    it('throws if script does not return a function', async () => {
      const brokenScript = 'return false;';

      xhr.get(numberUrl, (_, res) => res.status(200).body(brokenScript));

      const kelda = new Kelda();

      await expect(kelda.load(numberUrl)).rejects.toEqual(
        new KeldaError(
          "Script did not return a work function: '/path/to/number/script'"
        )
      );
    });
  });

  xdescribe('lazy loading work for later use', () => {
    // TODO
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
