import userSchema from '../schema/userSchema.js';
import User from '../models/User.js';
import { userStatus } from '../const/constant.js';
import MongoInternalException from '../exceptions/MongoInternalException.js';
import NotCreatedException from '../exceptions/NotCreatedEceptions.js';

const add = async (data) => {
  const user = await userSchema
    .findOneAndUpdate(
      { email: data.email, status: { $ne: userStatus.ACTIVE } },
      {
        $set: {
          status: userStatus.PENDING,
          ...data,
        },
      },
      { new: true, upsert: true }
    )
    .catch((error) => {
      throw new MongoInternalException('Error in adding user:', 'userRepository.add');
    });
  if (!user) {
    throw new NotCreatedException('Error during registering user', 'userRepository.add');
  }
  return new User(user);
};

const activate = async (id) => {
  const user = await userSchema.findOne({ _id: id });

  if (user.status === userStatus.ACTIVE) {
    return user.toJSON();
  }
  const updatedUser = await userSchema
    .findOneAndUpdate(
      { _id: id, status: userStatus.PENDING },
      { status: userStatus.ACTIVE },
      { new: true, upsert: false }
    )
    .catch((error) => {
      console.error('Error on updating user:', error.message);
      return null;
    });

  return updatedUser ? updatedUser.toJSON() : null;
};

const getByEmail = async (email) => {
  return await userSchema.findOne({ email: email }).catch((error) => {
    throw new MongoInternalException('Mongo internal error:', 'userRepository.getByEmail');
  });
};

export default { add, activate, getByEmail };
