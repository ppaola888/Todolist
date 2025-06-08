import { userStatus } from '../const/constant.js';
import MongoInternalException from '../exceptions/MongoInternalException.js';
import NotCreatedException from '../exceptions/NotCreatedEceptions.js';
import User from '../models/User.js';
import userSchema from '../schema/userSchema.js';

const add = async (data) => {
  const existingUser = await userSchema.findOne({ email: data.email });

  if (existingUser && !data.username) {
    data.username = existingUser.username;
  }

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
  const updatedUser = await userSchema.findOneAndUpdate({ _id: id, status: userStatus.PENDING }, { status: userStatus.ACTIVE }, { new: true, upsert: false }).catch((error) => {
    return null;
  });

  return updatedUser ? updatedUser.toJSON() : null;
};

const getByEmail = async (email) => {
  return await userSchema.findOne({ email: email }).catch((error) => {
    throw new MongoInternalException('Mongo internal error:', 'userRepository.getByEmail');
  });
};

const findByDisplayName = async ({ text = '', cursor = null, limit = 3, direction = 'next', sortBy }) => {
  const filter = {
    username: { $regex: `^${text}`, $options: 'i' },
  };

  if (cursor) {
    filter[sortBy] = direction === 'next' ? { $gt: cursor } : { $lt: cursor };
  }

  const sortOrder = direction === 'next' ? 1 : -1;

  const users = await userSchema
    .find(filter)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .select({ username: 1, _id: 1 })
    .catch((error) => {
      throw new MongoInternalException('Mongo internal error:', 'userRepository.findByDisplayName');
    });

  return users.map((user) => {
    return new User(user);
  });
};

export default { add, activate, getByEmail, findByDisplayName };
