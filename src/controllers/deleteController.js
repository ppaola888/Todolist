import activityService from '../services/activityService.js';

const remove = async (req, res) => {
  const activityId = req.params.id;
  try {
    const activity = await activityService.deleteActivity(activityId, data);
    res.status(200).json();
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

//const remove = async (req, res) => {
//  const activityId = req.params.id;
//  try {
//    const activity = await activityService.remove(activityId);
//    res.status(200).json();
//  } catch (error) {
//    res.status(error.status).json({ message: error.message });
//  }
//};

export default remove;
