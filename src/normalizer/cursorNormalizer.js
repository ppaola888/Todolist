const cursorNormalizer = (activities) => {
  const activitiesNormalized = activities.map((activity) => ({
    id: activity._id.toString(),
    name: activity.name,
    description: activity.description,
    status: activity.status,
    dueDate: activity.dueDate,
    userId: activity.userId,
  }));

  const nextCursor = activities.length > 0 ? activities[activities.length - 1]._id.toString() : null;
  const prevCursor = activities.length > 0 ? activities[0]._id.toString() : null;

  return {
    activities: activitiesNormalized,
    nextCursor,
    prevCursor,
  };
};

export default cursorNormalizer;
