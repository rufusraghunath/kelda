type Resolve = (result?: any) => void;
type Reject = (error?: Error) => void;
type Work = () => any; // TODO want Work<T> = () => T

interface Job {
  isDone: boolean;
  execute: () => Promise<any>; // TODO: get rid of this any
}

interface JobConstructor {
  new (work: Work): Job;
}
