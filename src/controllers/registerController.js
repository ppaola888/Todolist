import userService from "../services/userService.js";

const register = async (req, res) => {
  const data = req.body;
  const user = await userService.register(data);
  if (user) {
    res.status(201).json(user);
  } else {
    return res.status(500).json({ message: "Server error" });
  }
};

export default register;
