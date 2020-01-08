import Kelda from "kelda-js";

const work = () => 1 + 1;

const kelda = new Kelda();

kelda
  .orderWork(work)
  .then(console.log)
  .catch(console.error);

console.log("STARTED UP");
