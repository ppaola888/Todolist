import activityRepository from '../repository/activityRepository.js';

const addActivity = async (data) => {
  return await activityRepository.add(data);
};

const getActivities = async (userId, skip, limit) => {
  return await activityRepository.getActivities(userId, skip, limit);
};

const getActivitiesByCursor = async (userId, cursor, limit, direction) => {
  return await activityRepository.getActivitiesByCursor(userId, cursor, limit, direction);
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
  getActivitiesByCursor,
  getActivity,
  updateActivity,
  deleteActivity,
};
