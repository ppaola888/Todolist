import activityService from "../services/activityService.js";

const getMany = async (req, res) => {
  const activities = await activityService.getActivities();
  if (activities) {
    res.status(200).json(activities);
  } else {
    return res.status(404).json({ message: "no activities found" });
  }
};

export default getMany;
