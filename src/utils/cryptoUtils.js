import crypto from 'crypto';
import cryptoRandomString from 'crypto-random-string';
import config from '../../config/config.js';
import jwt from 'jsonwebtoken';

class CryptoUtils {
  generateUniqueCode(length, type = 'base64') {
    return cryptoRandomString({ length, type });
  }

  hashPassword(password) {
    const salt = this.generateUniqueCode(10);
    return {
      password: this.sha256(password, salt),
      salt: salt,
    };
  }
  sha256(data, salt) {
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
  }

  comparePassword(password, user) {
    return this.sha256(password, user.salt) === user.password;
  }

  generateTokens(user) {
    return {
      accessToken: this.generateToken(user, config.accessTokenExpiration),
      refreshToken: this.generateToken(user, config.refreshTokenExpiration),
    };
  }

  generateToken(user, expiration) {
    return jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: expiration,
      algorithm: 'RS256',
    });
  }

  verifyJWT(token) {
    const decoded = jwt.decode(token, process.env.JWT_PUBLIC_KEY, { algorithms: ['RS256'], ignoreExipration: false });
    return decoded;
  }
}

export default new CryptoUtils();
