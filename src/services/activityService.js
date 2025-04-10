import ActivityRepository from '../repository/activityRepository.js';

const addActivity = async (data) => {
  return await ActivityRepository.add(data);
};

const getActivities = async (userId, skip, limit, status) => {
  return await ActivityRepository.getActivities(userId, skip, limit, status);
};

const getActivitiesByCursor = async (userId, cursor, limit, direction, status) => {
  return await ActivityRepository.getActivitiesByCursor(userId, cursor, limit, direction, status);
};

const getActivity = async (id, userId) => {
  return await ActivityRepository.getActivity(id, userId);
};

const updateActivity = async (id, userId, data) => {
  return await ActivityRepository.updateActivity(id, userId, data);
};

const deleteActivity = async (id, userId) => {
  return await ActivityRepository.updateActivity(id, userId, { status: 'deleted' });
};

const completeActivity = async (id, userId) => {
  return await ActivityRepository.completeActivity(id, userId);
};

const reopenActivity = async (id, userId) => {
  return await ActivityRepository.reopenActivity(id, userId);
};

const archiveActivity = async (id, userId) => {
  return await ActivityRepository.archiveActivity(id, userId);
};

export default {
  addActivity,
  getActivities,
  getActivitiesByCursor,
  getActivity,
  updateActivity,
  deleteActivity,
  completeActivity,
  reopenActivity,
  archiveActivity,
};
