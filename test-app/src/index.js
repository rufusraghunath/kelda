import Kelda from 'kelda-js';
import inefficientFibonacci from './work/fib';

function inKelda() {
  result.innerText = 'Working in Kelda...';
}

function getArgSelect(idSuffix) {
  return document.getElementById(`num-${idSuffix}`);
}

function getArgFor(idSuffix) {
  return parseInt(getArgSelect(idSuffix).value, 10);
}

function fillSelectFor(idSuffix) {
  const select = getArgSelect(idSuffix);

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
fillSelectFor('eager');
fillSelectFor('lazy');

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
      const arg = getArgFor('main-thread');
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

  const arg = getArgFor('func');

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

  const arg = getArgFor('script');
  const exportName = document.getElementById('export-name-script').value;

  kelda
    .orderWork({ url: '/js/fib.js', exportName }, arg)
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      alert(e);
      result.innerText = 'Error';
    });
};

kelda
  .load({ url: '/js/fib.js' })
  .then(id => {
    document.getElementById('kelda-eager').onclick = () => {
      inKelda();

      const arg = getArgFor('eager');

      kelda
        .orderWork(id, arg)
        .then(data => (result.innerText = data))
        .catch(e => {
          console.error(e);
          alert(e);
          result.innerText = 'Error';
        });
    };
  })
  .catch(console.log);

const lazyId = kelda.lazy({ url: '/js/fib.js' });

document.getElementById('kelda-lazy').onclick = () => {
  inKelda();

  const arg = getArgFor('lazy');

  kelda
    .orderWork(lazyId, arg)
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      alert(e);
      result.innerText = 'Error';
    });
};
