function fibonacci(num) {
  if (num <= 1) return 1;

  return fibonacci(num - 1) + fibonacci(num - 2);
}

const DEFAULT = 45;

return function() {
  return fibonacci(DEFAULT);
};
