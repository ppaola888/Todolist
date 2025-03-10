import activityRepository from '../repository/activityRepository.js';

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
  const activity = await activityRepository.updateActivity(id, data);
  if (!activity) {
    throw new NotFoundException('Activity not found', 'activityRepository.updateActivity');
  }
  return activity;
};

const deleteActivity = async (id) => {
  return await activityRepository.updateActivity(id, { status: 'deleted' });
};

export default {
  addActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
};
