import userSchema from '../schema/userSchema.js';
import { userStatus } from '../const/constant.js';

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

export default { add, activate };
