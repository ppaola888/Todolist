import userRepository from '../repository/userRepository.js';
import cryptoUtils from '../utils/cryptoUtils.js';
import tokenRepository from '../repository/tokenRepository.js';
import EmailGatewayFactory from '../gateway/EmailGatewayFactory.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import { userStatus } from '../const/constant.js';
import UnauthorizedException from '../exceptions/UnauthorizedException.js';
import config from '../../config/config.js';

class UserService {
  constructor() {
    this.emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
  }
  async register(data) {
    const { password, salt } = cryptoUtils.hashPassword(data.password);
    data.password = password;
    data.salt = salt;

    const user = await userRepository.add(data);

    const registrationToken = cryptoUtils.generateUniqueCode(10);
    await tokenRepository.add(user.id, registrationToken);
    //const emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
    await this.emailGateway.sendRegistrationMail(user.email, registrationToken);
    return user;
  }

  async activate(token) {
    const tokenData = await tokenRepository.get(token);
    if (!tokenData) {
      throw new NotFoundException('Token not found', 'userService.activate');
    }
    const user = await userRepository.activate(tokenData.userId);
    if (!user) {
      throw new NotFoundException('Activation failed', 'userService.activate');
    }
    return user;
  }

  async login(email, password) {
    const user = await userRepository.getByEmail(email);
    if (!user || user.status !== userStatus.ACTIVE || !cryptoUtils.comparePassword(password, user)) {
      throw new UnauthorizedException('Unauthorized ', 'userService.login');
    }
    const { accessToken, refreshToken } = cryptoUtils.generateTokens(user);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    return { user, accessToken, refreshToken };
  }
}
export default new UserService();
