import activityService from '../services/activityService.js';

const update = async (req, res) => {
  const activityId = req.params.id;
  const userId = req.userId;
  const data = req.body;
  try {
    const activity = await activityService.updateActivity(activityId, data, userId);
    res.status(200).json(activity);
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export default update;
