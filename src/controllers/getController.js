import activityService from "../services/activityService.js";

const get = async (req, res) => {
  const id = req.params.id;
  console.log("ID ricevuto:", id, "Tipo:", typeof id);
  const activity = await activityService.getActivity(id);
  if (activity) {
    res.status(200).json(activity);
  } else {
    return res.status(404).json({ message: "no activity found" });
  }
};

export default get;
