import tokenSchema from "../schema/registrationTokenSchema.js";

const add = async (userId, token) => {
  const result = await tokenSchema
    .findOneAndUpdate(
      { userId: userId },
      { registrationToken: token },
      { upsert: true }
    )
    .catch((error) => {
      throw error;
    });
};

export default { add };
