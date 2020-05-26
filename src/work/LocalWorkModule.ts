class LocalWorkModule<T> implements WorkModule<T> {
  public readonly exportName = 'default';
  private work: Work<T>;

  constructor(source: Work<T>) {
    this.work = source;
  }

  public get(): Work<T> {
    return this.work;
  }

  public toString(): string {
    return `function(){
      return {
        default: ${this.work}
      }
    }`;
  }
}

export default LocalWorkModule;
