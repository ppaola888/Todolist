import cryptoUtils from '../utils/cryptoUtils.js';

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ message: 'Authentication error' });
  }
  const token = authorization.split(' ')[1];
  try {
    const decoded = cryptoUtils.verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Authentication error' });
    }
    req.userId = decoded.sub;
    next();
  } catch (error) {
    res.status(401).json({ message: `Authentication error: error.message` });
  }
};

export default authMiddleware;
