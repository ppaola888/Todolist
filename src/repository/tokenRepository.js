import MongoInternalException from '../exceptions/MongoInternalException.js';
import tokenSchema from '../schema/registrationTokenSchema.js';

const add = async (userId, token) => {
  const result = await tokenSchema
    .findOneAndUpdate({ userId: userId }, { registrationToken: token }, { new: true, upsert: true })
    .catch((error) => {
      throw new MongoInternalException(`Error in adding token', 'tokenRepository.add`);
    });
  return result;
};

const get = async (token) => {
  const result = await tokenSchema.findOne({ registrationToken: token }).catch((error) => {
    throw new MongoInternalException('Token not found', 'tokenRepository.get');
  });
  return result;
};

export default { add, get };
