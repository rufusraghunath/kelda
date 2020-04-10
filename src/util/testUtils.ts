import MockWorker from '../dom-mocks/MockWorker';
import MockURL from '../dom-mocks/MockURL';
import MockBlob from '../dom-mocks/MockBlob';

export const withWorkers = () => {
  window.Worker = MockWorker as any;
  window.URL = MockURL as any;
  window.Blob = MockBlob as any;
};

export const withoutWorkers = () => {
  delete window.Worker;
  delete window.URL;
  delete window.Blob;
};

export const work = () => 1 + 1;

export const addWork = (a: number, b: number) => a + b;

export const oneSecondWork = () =>
  new Promise(resolve => setTimeout(() => resolve(2), 1000));

export const errorWork = () => {
  throw new Error('The work failed');
};

export const flushPromises = () =>
  new Promise(resolve => process.nextTick(resolve));
// https://stackoverflow.com/questions/52177631/jest-timer-and-promise-dont-work-well-settimeout-and-async-function
// https://plafer.github.io/2015/09/08/nextTick-vs-setImmediate/
