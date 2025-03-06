import userSchema from "../schema/userSchema.js";

const add = async (data) => {
  const user = await userSchema.create(data).catch((error) => {
    console.error("Error on adding user:", error.message);
    return null;
  });
  return user.toJSON();
};

export default { add };
