class RemoteWorkModule<T> implements WorkModule<T> {
  public readonly exportName: string;
  private source: string;

  constructor(source: string, exportName: string) {
    this.source = source;
    this.exportName = exportName;
  }

  public get(): Work<T> {
    const module: RemoteModule<T> = Function(
      `"use-strict"; return ${this.source};`
    ).call(null);

    return module[this.exportName];
  }

  public toString(): string {
    // needed to prevent issues when last char of source is ;
    const wrapped = `function(){
      return ${this.source}
    }`;

    return `${wrapped}`;
  }
}

export default RemoteWorkModule;
