import BasicEmailGateway from './BasicEmailGateway.js';
import FakeEmailGateway from './FakeEmailGateway.js';

class EmailGatewayFactory {
  static build(type) {
    switch (type) {
      case 'basic':
        return new BasicEmailGateway();
      default:
        return new FakeEmailGateway();
    }
  }
}

export default EmailGatewayFactory;
