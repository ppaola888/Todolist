import DomainException from './DomainException.js';

class UnauthorizedException extends DomainException {
  constructor(message, code) {
    super(message);
    this.code = code || null;
    this.status = 401;
  }
}

export default UnauthorizedException;
