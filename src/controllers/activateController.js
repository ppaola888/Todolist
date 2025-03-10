import userService from '../services/userService.js';

const activate = async (req, res) => {
  const token = req.params.token;
  try {
    const user = await userService.activate(token);
    return res.status(200).json(user);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export default activate;
