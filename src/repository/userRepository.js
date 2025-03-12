import userSchema from '../schema/userSchema.js';
import { userStatus } from '../const/constant.js';
import MongoInternalException from '../exceptions/MongoInternalException.js';

const add = async (data) => {
  const user = await userSchema.create(data).catch((error) => {
    console.error('Error on adding user:', error.message);
    return null;
  });
  return user ? user.toJSON() : null;
};

const activate = async (id) => {
  const user = await userSchema
    .findOneAndUpdate(
      { _id: id, status: userStatus.PENDING },
      { status: userStatus.ACTIVE },
      {
        new: true,
        upsert: false,
      }
    )
    .catch((error) => {
      console.error('Error on updating user:', error.message);
      return null;
    });

  return user ? user.toJSON() : null;
};

const getByEmail = async (email) => {
  return await userSchema.findOne({ email: email }).catch((error) => {
    throw new MongoInternalException('Mongo internal error:', 'userRepository.getByEmail');
  });
};

export default { add, activate, getByEmail };
