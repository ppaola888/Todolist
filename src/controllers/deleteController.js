import activityService from "../services/activityService.js";

const remove = async (req, res) => {
  const activityId = req.params.id;
  const data = { status: "deleted" };
  const activity = await activityService.updateActivity(activityId, data);
  if (activity) {
    res.status(200).json(activity);
  } else {
    res.status(500).json({ message: "Server error" });
  }
};

export default remove;
