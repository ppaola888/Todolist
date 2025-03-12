import activityService from '../services/activityService.js';

const get = async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  try {
    const activity = await activityService.getActivity(id, userId);
    console.log(activity);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(error.status).json({ message: error.message });
  }
};

export default get;
