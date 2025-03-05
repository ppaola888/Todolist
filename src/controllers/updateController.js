import activityService from "../services/activityService.js";

const update = async (req, res) => {
  const activityId = req.params.id;
  const data = req.body;
  const activity = await activityService.updateActivity(activityId, data);
  if (activity) {
    res.status(200).json(activity.toJSON());
  } else {
    res.status(404).json({ message: "no activity found" });
  }
};

export default update;
