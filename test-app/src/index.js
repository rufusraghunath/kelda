import Kelda from 'kelda-js';
import getFibWork from './getFibWork';

const kelda = new Kelda();
const num = document.getElementById('num');

Array(45)
  .fill(null)
  .map((_, i) => i + 1)
  .forEach(i => {
    const option = document.createElement('option');

    option.value = i;
    option.innerText = i;

    num.appendChild(option);
  });

const seconds = document.getElementById('seconds');
let interval;

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
    const work = getFibWork();

    try {
      const data = work();

      result.innerText = data;
    } catch (e) {
      console.log(e);

      result.innerText = 'Error';
    }
  }, 0);
};

document.getElementById('kelda').onclick = () => {
  result.innerText = 'Working in Kelda...';

  kelda
    .orderWork(getFibWork())
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      result.innerText = 'Error';
    });
};

document.getElementById('kelda-script').onclick = () => {
  result.innerText = 'Working in Kelda...';

  kelda
    .orderWork('/js/hardcodedFib.js')
    .then(data => (result.innerText = data))
    .catch(e => {
      console.error(e);
      result.innerText = 'Error';
    });
};

kelda.load('/js/parameterizedFib.js').then(id => {
  document.getElementById('kelda-parameterized').onclick = () => {
    result.innerText = 'Working in Kelda...';

    const arg = num.value;

    kelda
      .orderWork(id, arg)
      .then(data => (result.innerText = data))
      .catch(e => {
        console.error(e);
        result.innerText = 'Error';
      });
  };
});
