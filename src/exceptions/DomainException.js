class DomainException extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainException';
    Error.captureStackTrace(this, this.constructor);
  }
}

export default DomainException;
