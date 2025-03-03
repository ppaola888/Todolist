import config from "../../config/config.js";
import fs from "fs";
import checkDb from "../utils/checkDb.js";
import getReadlineInterface from "../utils/readLine.js";
import activityRepository from "../src/repository/activityRepository.js";
const dbFile = config.dbFile;

const createId = () => {
  if (!checkDb()) {
    fs.openSync(dbFile, "w");
    //return 1;
  }
  const content = fs.readFileSync(dbFile);
  const activities = content.toString().split("\n");

  const last = activities[activities.length - 2];
  if (last && last !== "") {
    return JSON.parse(last).id + 1;
  }
  return 1;
};

const addActivity = (data) => {
  data.status = "open";
  data.createdAt = new Date().getTime();
  data.updatedAt = data.createdAt;
  data.id = createId();

  return activityRepository.add(data);
};

const getActivities = () => {
  return activityRepository.getActivities();
};

const getActivity = async (id) => {
  return await activityRepository.getActivity(id);
};

const updateActivity = async (id, data) => {
  return await activityRepository.updateActivity(id, data);
};

const lineHandler = (line, id, cb) => {
  const activity = JSON.parse(line);
  if (activity.id == id) {
    return cb(activity);
  }
  return activity;
};

export default { addActivity, getActivities, getActivity, updateActivity };
