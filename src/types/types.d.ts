type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type Work<T> = (...args: any[]) => T;

interface WorkModule<T> {
  get: () => Work<T>;
  toString: () => string;
}

interface Job<T> {
  isDone: boolean;
  with: (...args: any[]) => Job<T>;
  execute: () => Promise<T>;
}

interface JobConstructor {
  // TODO: type properly - not being added to Job
  new <T>(workModule: WorkModule<T>): Job<T>;
}
