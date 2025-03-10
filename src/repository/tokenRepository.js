import MongoInternalException from '../exceptions/MongoInternalException.js';
import tokenSchema from '../schema/registrationTokenSchema.js';

const add = async (userId, token) => {
  const result = await tokenSchema
    .findOneAndUpdate({ userId: userId }, { registrationToken: token }, { new: true, upsert: true })
    .catch((error) => {
      throw error;
    });
  return result;
};

const get = async (token) => {
  const result = await tokenSchema.findOne({ registrationToken: token }).catch((error) => {
    throw new MongoInternalException('Errore durante la ricerca', 'tokenRepository.get');
  });
  return result;
};

export default { add, get };
