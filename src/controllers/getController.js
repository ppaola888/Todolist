import activityService from '../services/activityService.js';

const get = async (req, res) => {
  const activityId = req.params.id;
  const userId = req.userId;
  try {
    const activity = await activityService.getActivity(activityId, userId);
    res.status(200).json(activity);
  } catch (error) {
    return res.status(error.status).json({ message: error.message });
  }
};

export default get;
