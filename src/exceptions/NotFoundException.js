import DomainException from './DomainException.js';

class NotFoundException extends DomainException {
  constructor(message, code) {
    super(message);
    this.code = code || null;
    this.status = 404;
  }
}

export default NotFoundException;
