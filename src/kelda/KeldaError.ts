class KeldaError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = "KeldaError";
  }
}

export default KeldaError;
