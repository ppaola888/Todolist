import InternalServiceException from './InternalServerException.js';

class NotCreatedException extends InternalServiceException {
  constructor(message, code) {
    super(message, code);
  }
}

export default NotCreatedException;
