type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type Work<T> = (...args: any[]) => T;

interface Job<T> {
  isDone: boolean;
  with: (...args: any[]) => Job<T>;
  execute: () => Promise<T>;
}

interface JobConstructor {
  new <T>(work: Work<T>): Job<T>;
}
