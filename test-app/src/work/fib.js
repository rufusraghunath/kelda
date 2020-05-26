export function inefficientFibonacci(num) {
  if (num === 0) return 0;
  if (num === 1) return 1;

  return inefficientFibonacci(num - 1) + inefficientFibonacci(num - 2);
}

export default inefficientFibonacci;
