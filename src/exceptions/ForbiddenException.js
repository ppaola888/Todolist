import DomainException from './DomainException.js';

class ForbiddenException extends DomainException {
  constructor(message, code) {
    super(message);
    this.code = code || null;
    this.status = 403;
  }
}

export default ForbiddenException;
