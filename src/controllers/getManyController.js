import activityService from '../services/activityService.js';
import cursorNormalizer from '../normalizer/cursorNormalizer.js';

const getMany = async (req, res) => {
  const userId = req.userId;
  const skip = req.query.skip;
  const limit = req.query.limit;
  const status = req.query.status || 'open';

  try {
    const activities = await activityService.getActivities(userId, skip, limit, status);

    res.status(200).json({
      activities,
      skip,
      limit,
      status,
    });
  } catch (error) {
    if (error.status) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getActivitiesByCursor = async (req, res) => {
  try {
    const userId = req.userId;

    const { cursor, limit, direction, status } = req.query;

    const activitiesResult = await activityService.getActivitiesByCursor(userId, cursor, limit, direction, status);

    const { activities, nextCursor, prevCursor } = cursorNormalizer(activitiesResult);

    return res.status(200).json({
      activities,
      nextCursor,
      prevCursor,
      direction,
    });
  } catch (error) {
    if (error.status) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export { getMany, getActivitiesByCursor };
