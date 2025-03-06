import config from "../../config/config.js";
import activitySchema from "../schema/todoListSchema.js";
import Activity from "../models/Activity.js";

const add = async (data) => {
  const activity = await activitySchema.create(data).catch((error) => {
    console.error("Error on adding activity:", error.message);
    return null;
  });
  return new Activity(activity);
  //return activity.toJSON({ flattenObjectIds: true, versionKey: false });
};

const getActivities = async () => {
  const activities = await activitySchema.find().catch((error) => {
    console.error("Error on getting activities:", error.message);
    return null;
  });
  return activities.map((activity) => new Activity(activity));
};

const getActivity = async (id) => {
  const activity = await activitySchema.findById(id).catch((error) => {
    console.error("Error on getting activity:", error.message);
    return null;
  });
  return new Activity(activity);
};

const updateActivity = async (id, data) => {
  const updatedActivity = await activitySchema
    .findByIdAndUpdate({ id }, data, { upsert: false, new: true })
    .catch((error) => {
      console.error("Error on updating activity:", error.message);
      return null;
    });
  return new Activity(updatedActivity);
};

const remove = async (id) => {
  const deletedActivity = await activitySchema
    .findByIdAndDelete(id)
    .catch((error) => {
      console.error("Error on removing activity:", error.message);
      return null;
    });
  return new Activity(deletedActivity);
};

export default { add, getActivities, getActivity, updateActivity, remove };
