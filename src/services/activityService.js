import activityRepository from '../repository/activityRepository.js';

const addActivity = async (data) => {
  return await activityRepository.add(data);
};

const getActivities = async (userId) => {
  return await activityRepository.getActivities(userId);
};

const getActivity = async (id, userId) => {
  return await activityRepository.getActivity(id, userId);
};

const updateActivity = async (id, data, userId) => {
  const activity = await activityRepository.updateActivity(id, userId, data);
  if (!activity) {
    throw new NotFoundException('Activity not found', 'activityRepository.updateActivity');
  }
  return activity;
};

const deleteActivity = async (id, userId) => {
  return await activityRepository.updateActivity(id, userId, { status: 'deleted' });
};

export default {
  addActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
};
