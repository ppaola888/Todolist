import activityService from '../services/activityService.js';

const update = async (req, res) => {
  const activityId = req.params.id;
  const data = req.body;
  try {
    const activity = await activityService.updateActivity(activityId, data);
    res.status(200).json(activity.toJSON());
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

export default update;
