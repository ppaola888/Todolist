import { status } from '../const/constant.js';
import MongoInternalException from '../exceptions/MongoInternalException.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import Activity from '../models/Activity.js';
import activitySchema from '../schema/todoListSchema.js';

class ActivityRepository {
  constructor() {}
  async add(data) {
    const activity = await activitySchema.create(data).catch((error) => {
      throw new MongoInternalException('Error on adding activity:', 'ActivityRepository.add');
    });
    return new Activity(activity);
  }

  async getActivities(userId, skip, limit, status) {
    const activities = await activitySchema
      .find({
        userId,
        status,
      })
      //.sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .catch((error) => {
        console.log(error);
        throw new MongoInternalException('Error on getting activities', 'ActivityRepository.getActivities');
      });
    if (activities.length === 0) {
      throw new NotFoundException('Activities not found', 'ActivityRepository.getActivities');
    }
    return activities.map((activity) => new Activity(activity));
  }

  async getActivitiesByCursor(userId, cursor, limit, direction, status) {
    const filter = {
      userId,
      ...(status ? { status } : { status: { $ne: 'deleted' } }),
    };

    let cursorQuery = {};

    if (cursor) {
      cursorQuery = {
        _id: direction === 'next' ? { $gt: cursor } : { $lt: cursor },
      };
    }

    const query = { ...filter, ...cursorQuery };

    const activitiesResult = await activitySchema
      .find(query)
      .sort({ _id: 1 })
      .limit(limit)
      .catch((error) => {
        throw new MongoInternalException('Error on getting activities by cursor', 'ActivityRepository.getActivitiesByCursor');
      });
    if (activitiesResult.length === 0) {
      throw new NotFoundException('Activities not found', 'ActivityRepository.getActivitiesByCursor');
    }
    return activitiesResult;
  }

  async getActivity(activityId, userId) {
    const activity = await activitySchema.findOne({ _id: activityId, userId }).catch((error) => {
      throw new MongoInternalException('Error on getting activity:', 'ActivityRepository.getActivity');
    });
    if (!activity) {
      throw new NotFoundException('Activity not found', 'ActivityRepository.getActivity');
    }
    return new Activity(activity);
  }

  async updateActivity(id, userId, data) {
    const activity = await activitySchema
      .findOneAndUpdate({ _id: id, userId }, data, {
        upsert: false,
        new: true,
      })
      .catch((error) => {
        throw new MongoInternalException('Error on updating activity:', 'ActivityRepository.updateActivity');
      });
    if (!activity) {
      throw new NotFoundException('Activity not found or not updated', 'ActivityRepository.updateActivity');
    }
    return new Activity(activity);
  }

  async completeActivity(id, userId) {
    const activity = await activitySchema.findOneAndUpdate({ _id: id, userId: userId, status: { $in: [status.OPEN, status.COMPLETED] } }, { $set: { status: status.COMPLETED } }, { new: true }).catch((error) => {
      throw new MongoInternalException('Error on updating activity', 'ActivityRepository.updateActivity');
    });

    if (!activity) {
      throw new NotFoundException('Activity not found or not updated', 'ActivityRepository.updateActivity');
    }
    return new Activity(activity);
  }

  async reopenActivity(id, userId) {
    const activity = await activitySchema.findOneAndUpdate({ _id: id, userId: userId, status: status.COMPLETED }, { $set: { status: status.OPEN } }, { new: true }).catch((error) => {
      throw new MongoInternalException('Error on reopen activity', 'ActivityRepository.reopenActivity');
    });

    if (!activity) {
      throw new NotFoundException('Activity not found or cannot be reopen', 'ActivityRepository.reopenActivity');
    }
    return new Activity(activity);
  }

  async archiveActivity(id, userId) {
    const activity = await activitySchema.findOneAndUpdate({ _id: id, userId, status: status.COMPLETED }, { $set: { status: status.ARCHIVED } }, { new: true }).catch((error) => {
      throw new MongoInternalException('Error on archiving activity', 'ActivityRepository.archiveActivity');
    });

    if (!activity) {
      throw new NotFoundException('Activity not found or cannot be archived', 'ActivityRepository.archiveActivity');
    }
    return new Activity(activity);
  }
}

export default new ActivityRepository();
