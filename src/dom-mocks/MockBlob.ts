type BlobTypes = "text/javascript";

interface BlobOptions {
  type: BlobTypes;
}

class MockBlob implements Blob {
  public size = 0;
  public type = "MockBlob";
  private script: string;

  constructor(scriptParts: string[], options: BlobOptions) {
    if (!options || options.type !== "text/javascript") {
      throw new Error("MockBlob can only have type 'text/javascript'");
    }
    this.script = scriptParts[0];
    this.size = this.script.length;
  }

  public getScript(): string {
    return this.script;
  }

  public slice(): MockBlob {
    throw new Error("Not implemented!");
  }
}

export default MockBlob;
