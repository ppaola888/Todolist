import cryptoUtils from '../utils/cryptoUtils.js';

const authMiddleware = (req, res, next) => {
  console.log('Inside authMiddleware');
  console.log('Request query:', req.query);
  console.log('Headers:', req.headers);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: `Authentication error: ${error.message}` });
  }
  const token = authorization.split(' ')[1];
  try {
    const decoded = cryptoUtils.verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({ message: `Authentication error: ${error.message}` });
    }
    req.userId = decoded.sub;
    next();
  } catch (error) {
    res.status(401).json({ message: `Authentication error: error.message` });
  }
};

export default authMiddleware;
