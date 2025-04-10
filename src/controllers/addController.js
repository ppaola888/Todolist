import activityService from '../services/activityService.js';

const addController = async (req, res) => {
  const data = { ...req.body, userId: req.userId };
  const activity = await activityService.addActivity(data);
  if (activity) {
    res.status(201).json(activity.toJSON());
  } else {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default addController;
