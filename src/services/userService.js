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
    const emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
    console.log(emailGateway === this.emailGateway);
    this.emailGateway = emailGateway;
  }
  async register(data) {
    //this.emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
    const { password, salt } = await cryptoUtils.hashPassword(data.password);
    data.password = password;
    data.salt = salt;
    const user = await userRepository.add(data);
    const registrationToken = cryptoUtils.generateUniqueCode(10);
    await tokenRepository.add(user._id, registrationToken);
    //const emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
    this.emailGateway.sendRegistrationMail(user.email, registrationToken);
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
    console.log('User activated:', user);
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
    //return user;
    return { user, accessToken, refreshToken };
  }
}
export default new UserService();

//const register = async (data) => {
//  const { password, salt } = await cryptoUtils.hashPassword(data.password);
//  data.password = password;
//  data.salt = salt;
//  const user = await userRepository.add(data);
//  const registrationToken = cryptoUtils.generateUniqueCode(10);
//  await tokenRepository.add(user._id, registrationToken);
//  const emailGateway = EmailGatewayFactory.build(config.mailConfig.type);
//  await emailGateway.sendRegistrationMail(user.email, registrationToken);
//  return user;
//};
//
//const activate = async (token) => {
//  const tokenData = await tokenRepository.get(token);
//  if (!tokenData) {
//    throw new NotFoundException('Token not found', 'userService.activate');
//  }
//  const user = await userRepository.activate(tokenData.userId);
//  if (!user) {
//    throw new NotFoundException('Activation failed', 'userService.activate');
//  }
//  console.log('User activated:', user);
//  return user;
//};
//
//const login = async (email, password) => {
//  const user = await userRepository.getByEmail(email);
//  if (!user || user.status !== userStatus.ACTIVE || !cryptoUtils.comparePassword(password, user)) {
//    throw new UnauthorizedException('Unauthorized ', 'userService.login');
//  }
//  const { accessToken, refreshToken } = cryptoUtils.generateTokens(user);
//  user.accessToken = accessToken;
//  user.refreshToken = refreshToken;
//  return user;
//  //return { user, accessToken, refreshToken };
//};
//
//export default { register, activate, login };
