type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type Work<T> = () => T;

interface Job<T> {
  isDone: boolean;
  execute: () => Promise<T>;
}

interface JobConstructor {
  new <T>(work: Work<T>): Job<T>;
}
