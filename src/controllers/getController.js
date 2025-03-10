import activityService from '../services/activityService.js';

const get = async (req, res) => {
  const id = req.params.id;
  try {
    const activity = await activityService.getActivity(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity.toJSON());
  } catch (error) {
    return res.status(error.status).json({ message: error.message });
  }
};

export default get;
