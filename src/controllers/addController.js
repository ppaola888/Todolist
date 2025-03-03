import addActivity from "../services/activityService.js";

const addController = async (req, res) => {
  const data = req.body;
  const activity = addActivity(data);
  if (activity) {
    res.status(201).json(activity);
  } else {
    return res.status(500).json({ message: "Server error" });
  }
};

export default addController;
