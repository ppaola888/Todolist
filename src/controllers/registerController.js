import userService from '../services/userService.js';

const register = async (req, res) => {
  const data = req.body;
  try {
    const user = await userService.register(data);

    return res.status(201).json({ message: 'Registrazione riuscita' });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    return res.status(500).json({ code: 'SERVER_ERROR', message: 'Error while registering user' });
  }
};

export default register;
