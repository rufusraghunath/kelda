interface RemoteModule<T> {
  [key: string]: Work<T>;
}

class RemoteWorkModule<T> implements WorkModule<T> {
  private source: string;
  private exportName: string;

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
    const wrapped = `function() {
      return ${this.source}
    }`;

    return `(${wrapped})()["${this.exportName}"]`;
  }
}

export default RemoteWorkModule;
