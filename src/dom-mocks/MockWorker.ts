type EventHandler = (e: Event) => void;

interface InnerWorkerScope {
  messageHandlers: EventHandler[];
  onmessage: (e: Event) => void;
  postMessage: (e: Event) => void;
}

// TODO:  Can I use some Node magic to actually run this work
//        on a separate thread for simulation purposes?
class MockWorker implements Worker {
  public onmessage: any;
  public onerror: any;
  private innerScope: InnerWorkerScope = {
    messageHandlers: [],
    onmessage: () => {
      throw new Error("Error: onmessage should be overriden");
    },
    postMessage(message) {
      this.messageHandlers.forEach(handler =>
        handler({ data: message } as MessageEvent)
      );
    }
  };

  constructor(objectUrl: string) {
    const stringifiedJs = objectUrl; // need to get script from URL first
    this.initInsideScope(stringifiedJs);
  }

  private initInsideScope(stringifiedJs: string) {
    const wrapped = `(function(){
      const self = this;

      ${stringifiedJs}
    })`;

    eval(wrapped).call(this.innerScope);
  }

  public postMessage(message: Event) {
    this.innerScope.onmessage(message);
  }

  public addEventListener(eventType: string, handler: EventHandler) {
    if (eventType === "message") {
      this.innerScope.messageHandlers.push(handler);
    }
  }

  public terminate() {
    throw new Error("Not implemented!");
  }

  public removeEventListener() {
    throw new Error("Not implemented!");
  }

  public dispatchEvent(): boolean {
    throw new Error("Not implemented!");
  }
}

export default MockWorker;
