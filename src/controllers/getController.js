import activityService from "../services/activityService.js";

const get = async (req, res) => {
  const id = req.params.id;
  const activity = await activityService.getActivity(id);
  if (activity) {
    res.status(200).json(activity.toJSON());
  } else {
    return res.status(404).json({ message: "no activity found" });
  }
};

export default get;
