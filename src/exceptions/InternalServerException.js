import DomainException from './DomainException.js';

class InternalServerException extends DomainException {
  constructor(message, code) {
    super(message);
    this.code = code || null;
    this.status = 500;
  }
}

export default InternalServerException;
