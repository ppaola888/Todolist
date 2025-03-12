import userService from '../services/userService.js';
import userNormalizer from '../normalizer/userNormalizer.js';

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, accessToken, refreshToken } /*loginResponse*/ = await userService.login(email, password);
    return res.status(200).json(userNormalizer(user, accessToken, refreshToken) /*loginResponse*/);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export default login;
