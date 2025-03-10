import userService from '../services/userService.js';

const register = async (req, res) => {
  const data = req.body;
  try {
    const user = await userService.register(data);
    if (!user) {
      throw new NotFoundException('User registration failed', 'registerController.register');
      //return res.status(500).json({ error: 'Registration has failed' });
    }
    return res.status(201).json(user);
  } catch (error) {
    return res.status(error.status).json({ message: error.message });
  }
};

export default register;
