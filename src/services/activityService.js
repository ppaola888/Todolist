import activityRepository from "../repository/activityRepository.js";

const addActivity = async (data) => {
  return await activityRepository.add(data);
};

const getActivities = async () => {
  return await activityRepository.getActivities();
};

const getActivity = async (id) => {
  return await activityRepository.getActivity(id);
};

const updateActivity = async (id, data) => {
  return await activityRepository.updateActivity(id, data);
};

const remove = async (id) => {
  return await activityRepository.remove(id);
};

const lineHandler = (line, id, cb) => {
  const activity = JSON.parse(line);
  if (activity.id == id) {
    return cb(activity);
  }
  return activity;
};

export default {
  addActivity,
  getActivities,
  getActivity,
  updateActivity,
  remove,
};
