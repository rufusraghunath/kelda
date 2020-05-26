import xhr from 'xhr-mock';
import fs from 'fs';
import path from 'path';
import WorkModuleLoader from './WorkModuleLoader';
import KeldaError from '../kelda/KeldaError';

describe('WorkLoader', () => {
  const numberUrl = '/path/to/number/script';
  const numberScript = fs
    .readFileSync(path.join(__dirname, '../util/test/modules/number.js'))
    .toString();

  beforeEach(() => {
    xhr.setup();
  });

  afterEach(() => {
    xhr.teardown();
  });

  it('fetches remote work module from script for given export', async () => {
    xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

    const workModule = await new WorkModuleLoader(numberUrl, 'default').get();
    const work = workModule.get();

    expect(work()).toBe(30);
  });

  it('uses "default" as export name if none is provided', async () => {
    xhr.get(numberUrl, (_, res) => res.status(200).body(numberScript));

    const workModule = await new WorkModuleLoader(numberUrl).get();
    const work = workModule.get();

    expect(work()).toBe(30);
  });

  it('throws when status is 400', async () => {
    xhr.get(numberUrl, (_, res) => res.status(400));

    const loader = new WorkModuleLoader(numberUrl, 'default');

    await expect(loader.get()).rejects.toEqual(
      new KeldaError("Could not load work from url: '/path/to/number/script'")
    );
  });

  it('throws when status is 500', async () => {
    xhr.get(numberUrl, (_, res) => res.status(500));

    const loader = new WorkModuleLoader(numberUrl, 'default');

    await expect(loader.get()).rejects.toEqual(
      new KeldaError("Could not load work from url: '/path/to/number/script'")
    );
  });
});
