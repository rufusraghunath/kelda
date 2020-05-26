import Kelda from './Kelda';
import {
  work,
  withoutWorkers,
  errorWork,
  addWork
} from '../util/test/testUtils';
import KeldaError from './KeldaError';
import xhr from 'xhr-mock';
import fs from 'fs';
import path from 'path';

describe('Kelda', () => {
  const numberUrl = '/path/to/number/script';
  const stringUrl = '/path/to/string/script';
  const booleanUrl = '/path/to/boolean/script';
  const argumentsUrl = '/path/to/arguments/script';
  const namedUrl = '/path/to/named/script';
  const numberParams = { url: numberUrl };
  const stringParams = { url: stringUrl };
  const booleanParams = { url: booleanUrl };
  const argumentsParams = { url: argumentsUrl };

  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();
  const stringScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/string.js'))
    .toString();
  const booleanScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/boolean.js'))
    .toString();
  const argumentsScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/arguments.js'))
    .toString();
  const namedScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/named.js'))
    .toString();

  beforeEach(() => {
    xhr.setup();
  });

  afterEach(() => {
    xhr.teardown();
  });

  describe('executing work from functions', () => {
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

    it('can apply args to work', async () => {
      const kelda = new Kelda();
      const result = await kelda.orderWork(addWork, 1, 2);

      expect(result).toBe(3);
    });
  });

  describe('executing work from script url', () => {
    it('when Workers are available', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const result = await kelda.orderWork(numberParams);

      expect(result).toBe(30);
    });

    it('handles named exports', async () => {
      xhr.get(namedUrl, (_, res) => res.status(200).body(namedScript));

      const kelda = new Kelda();
      const result = await kelda.orderWork(
        { url: namedUrl, exportName: 'add' },
        8,
        2
      );

      expect(result).toBe(10);
    });

    it('when Workers are unavailable', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));
      withoutWorkers();

      const kelda = new Kelda();
      const result = await kelda.orderWork(numberParams);

      expect(result).toBe(30);
    });

    it('can apply args to work', async () => {
      xhr.get(argumentsUrl, (_, res) => res.status(200).body(argumentsScript));

      const kelda = new Kelda();
      const result = await kelda.orderWork(argumentsParams, 1, 2);

      expect(result).toBe(53);
    });

    it('throws when there is a problem loading the script', async () => {
      xhr.get(numberUrl, (_, res) => res.status(500));

      const kelda = new Kelda();

      await expect(kelda.orderWork(numberParams)).rejects.toEqual(
        new KeldaError("Could not load work from url: '/path/to/number/script'")
      );
    });
  });

  describe('executing work from work id', () => {
    it('throws when provided work id is invalid', async () => {
      xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

      const kelda = new Kelda();
      const invalidId = 99;

      await expect(kelda.orderWork(invalidId)).rejects.toEqual(
        new KeldaError("Invalid work id: '99'")
      );
    });

    describe('eager loading', () => {
      it('should provide work id for a given script', async () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

        const kelda = new Kelda();
        const id = await kelda.load(numberParams);

        expect(id).toEqual(expect.any(Number));
      });

      it('should execute work for given work id', async () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

        const kelda = new Kelda();
        const id = await kelda.load(numberParams);
        const result = await kelda.orderWork(id);

        expect(result).toBe(30);
      });

      it('can load and execute multiple work functions', async () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));
        xhr.get(stringUrl, (_, res) => res.status(200).body(stringScript));
        xhr.get(booleanUrl, (_, res) => res.status(200).body(booleanScript));

        const kelda = new Kelda();
        const id1 = await kelda.load(numberParams);
        const id2 = await kelda.load(stringParams);
        const id3 = await kelda.load(booleanParams);
        const result1 = await kelda.orderWork(id1);
        const result2 = await kelda.orderWork(id2);
        const result3 = await kelda.orderWork(id3);

        expect(result1).toBe(30);
        expect(result2).toBe('aabb');
        expect(result3).toBe(true);
      });

      it('can apply args to work', async () => {
        xhr.get(argumentsUrl, (_, res) =>
          res.status(200).body(argumentsScript)
        );

        const kelda = new Kelda();
        const id = await kelda.load(argumentsParams);
        const result = await kelda.orderWork(id, 1, 2);

        expect(result).toBe(53);
      });

      it('throws when there is a problem loading the script', async () => {
        xhr.get(numberUrl, (_, res) => res.status(500));

        const kelda = new Kelda();

        await expect(kelda.load(numberParams)).rejects.toEqual(
          new KeldaError(
            "Could not load work from url: '/path/to/number/script'"
          )
        );
      });
    });

    describe('lazy loading', () => {
      it('should provide work id for a given script', () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

        const kelda = new Kelda();
        const id = kelda.lazy(numberParams);

        expect(id).toEqual(expect.any(Number));
      });

      it('should execute work for given work id', async () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

        const kelda = new Kelda();
        const id = kelda.lazy(numberParams);
        const result = await kelda.orderWork(id);

        expect(result).toBe(30);
      });

      it('can load and execute multiple work functions', async () => {
        xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));
        xhr.get(stringUrl, (_, res) => res.status(200).body(stringScript));
        xhr.get(booleanUrl, (_, res) => res.status(200).body(booleanScript));

        const kelda = new Kelda();
        const id1 = kelda.lazy(numberParams);
        const id2 = kelda.lazy(stringParams);
        const id3 = kelda.lazy(booleanParams);
        const result1 = await kelda.orderWork(id1);
        const result2 = await kelda.orderWork(id2);
        const result3 = await kelda.orderWork(id3);

        expect(result1).toBe(30);
        expect(result2).toBe('aabb');
        expect(result3).toBe(true);
      });

      it('can apply args to work', async () => {
        xhr.get(argumentsUrl, (_, res) =>
          res.status(200).body(argumentsScript)
        );

        const kelda = new Kelda();
        const id = kelda.lazy(argumentsParams);
        const result = await kelda.orderWork(id, 1, 2);

        expect(result).toBe(53);
      });

      it('throws when there is a problem loading the script', async () => {
        xhr.get(numberUrl, (_, res) => res.status(500));

        const kelda = new Kelda();
        const id = kelda.lazy(numberParams);

        await expect(kelda.orderWork(id)).rejects.toEqual(
          new KeldaError(
            "Could not load work from url: '/path/to/number/script'"
          )
        );
      });
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
