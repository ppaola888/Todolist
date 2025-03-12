import activitySchema from '../schema/todoListSchema.js';
import Activity from '../models/Activity.js';
import MongoInternalException from '../exceptions/MongoInternalException.js';
import NotFoundException from '../exceptions/NotFoundException.js';

const add = async (data) => {
  const activity = await activitySchema.create(data).catch((error) => {
    console.error('Error on adding activity:', error.message);
    return null;
  });
  return new Activity(activity);
  //return activity.toJSON({ flattenObjectIds: true, versionKey: false });
};

const getActivities = async (userId) => {
  const activities = await activitySchema.find({ userId }).catch((error) => {
    throw new MongoInternalException('Error on getting activities', 'activityRepository.getActivities');
    //console.error('Error on getting activities:', error.message);
  });
  return activities.map((activity) => new Activity(activity));
};

const getActivity = async (id, userId) => {
  const activity = await activitySchema.findOne({ _id: id, userId }).catch((error) => {
    throw new MongoInternalException('Error on getting activity:', 'activityRepository.getActivity');
  });
  if (!activity) {
    throw new NotFoundException('Activity not found', 'activityRepository.getActivity');
  }
  return activity.toJSON({ flattenObjectIds: true, versionKey: false });
};

const updateActivity = async (id, userId, data) => {
  const activity = await activitySchema
    .findOneAndUpdate({ _id: id, userId: userId }, data, { upsert: false, new: true })
    .catch((error) => {
      throw new MongoInternalException('Error on updating activity:', 'activityRepository.updateActivity');
    });
  return activity ? activity.toJSON({ flattenObjectIds: true, versionKey: false }) : null;
};

//const remove = async (id) => {
//  const deletedActivity = await activitySchema.findByIdAndDelete(id).catch((error) => {
//    console.error('Error on removing activity:', error.message);
//    return null;
//  });
//  return new Activity(deletedActivity);
//};

export default { add, getActivities, getActivity, updateActivity };
