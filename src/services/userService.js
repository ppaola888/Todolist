import userRepository from "../repository/userRepository.js";
import cryptoUtils from "../utils/cryptoUtils.js";
import tokenRepository from "../repository/tokenRepository.js";
import mailGateway from "../gataway/mailGateway.js";

const register = async (data) => {
  const { password, salt } = await cryptoUtils.hashPassword(data.password);
  data.password = password;
  data.salt = salt;
  const user = await userRepository.add(data);
  const registrationToken = cryptoUtils.generateUniqueCode(10);
  await tokenRepository.add(user._id, registrationToken);

  mailGateway.sendRegistrationMail(user.email, registrationToken);
  return user;
};

export default { register };
