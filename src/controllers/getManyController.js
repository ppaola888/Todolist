import activityService from '../services/activityService.js';
import cursorNormalizer from '../normalizer/cursorNormalizer.js';

const getMany = async (req, res) => {
  const userId = req.userId;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const activities = await activityService.getActivities(userId, skip, limit);
  //console.log(`Skip: ${skip}, Limit: ${limit}`);
  if (activities) {
    res.status(200).json(activities);
  } else {
    return res.status(404).json({ message: 'No activities found' });
  }
};

const getActivitiesByCursor = async (req, res) => {
  try {
    //console.log('Cursor in controller:', req.pagination.cursor);
    const userId = req.userId;
    const { cursor, limit, direction } = req.query;

    const activitiesResult = await activityService.getActivitiesByCursor(userId, limit, cursor, direction);

    console.log('Activities Result:', activitiesResult);

    if (activitiesResult.length > 0) {
      const { activities, nextCursor, prevCursor } = cursorNormalizer(activitiesResult);

      return res.status(200).json({
        activities,
        nextCursor,
        prevCursor,
        direction,
      });
    } else {
      return res.status(404).json({ message: 'No activities found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getMany, getActivitiesByCursor };
