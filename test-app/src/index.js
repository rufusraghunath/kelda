import Kelda from 'kelda-js';
import inefficientFibonacci from './work/fib';

function inKelda() {
  result.innerText = 'Working in Kelda...';
}

function getSelect(idSuffix) {
  return document.getElementById(`num-${idSuffix}`);
}

function getValueFor(idSuffix) {
  return parseInt(getSelect(idSuffix).value, 10);
}

function fillSelectFor(idSuffix) {
  const select = getSelect(idSuffix);

  Array(46)
    .fill(null)
    .map((_, i) => i)
    .forEach(i => {
      const option = document.createElement('option');

      option.value = i;
      option.innerText = i;

      select.appendChild(option);
    });
}

const kelda = new Kelda();
const seconds = document.getElementById('seconds');
let interval;

fillSelectFor('main-thread');
fillSelectFor('func');
fillSelectFor('script');
fillSelectFor('cached');

document.getElementById('start').onclick = () => {
  const startTime = Date.now();

  interval = setInterval(() => {
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - startTime) / 1000);

    seconds.innerText = elapsed;
  }, 1000);
};

document.getElementById('stop').onclick = () => {
  clearInterval(interval);

  seconds.innerText = 0;
};

const result = document.getElementById('result');

document.getElementById('main-thread').onclick = () => {
  result.innerText = 'Working in main thread...';

  setTimeout(() => {
    try {
      const arg = getValueFor('main-thread');
      const data = inefficientFibonacci(arg);

      result.innerText = data;
    } catch (e) {
      console.log(e);

      result.innerText = 'Error';
    }
  }, 0);
};

document.getElementById('kelda').onclick = () => {
  inKelda();

  function inefficientFibonacci(num) {
    if (num === 0) return 0;
    if (num === 1) return 1;

    return inefficientFibonacci(num - 1) + inefficientFibonacci(num - 2);
  }

  const arg = getValueFor('func');

  kelda
    .orderWork(inefficientFibonacci, arg)
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      result.innerText = 'Error';
    });
};

document.getElementById('kelda-script').onclick = () => {
  inKelda();

  const arg = getValueFor('script');

  kelda
    .orderWork({ url: '/js/fib.js' }, arg)
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      result.innerText = 'Error';
    });
};

kelda
  .load({ url: '/js/fib.js' })
  .then(id => {
    document.getElementById('kelda-cached').onclick = () => {
      inKelda();

      const arg = getValueFor('cached');

      kelda
        .orderWork(id, arg)
        .then(data => (result.innerText = data))
        .catch(e => {
          console.error(e);
          result.innerText = 'Error';
        });
    };
  })
  .catch(console.log);
