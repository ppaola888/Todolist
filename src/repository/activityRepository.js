import config from "../../config/config.js";
import fs from "fs";
import checkDb from "../utils/checkDb.js";
import getReadlineInterface from "../utils/readLine.js";
const dbFile = config.dbFile;

const add = (data) => {
  try {
    fs.appendFileSync(dbFile, JSON.stringify(data) + "\n");
    return data;
  } catch (error) {
    console.error("Error on adding activity:", error.message);
    return null;
  }
};

const getActivities = () => {
  if (!checkDb()) {
    return null;
  }
  const content = fs.readFileSync(dbFile);
  const activities = content
    .toString()
    .trim()
    .split("\n")
    .map((item) => JSON.parse(item));
  return activities;
};

const getActivity = async (id) => {
  if (!checkDb()) {
    return null;
  }
  try {
    return await new Promise((resolve, reject) => {
      const readlineInterface = getReadlineInterface();

      readlineInterface.on("line", (line) => {
        const activity = lineHandler(line, id, (activity) => {
          resolve(activity);
        });
      });
      readlineInterface.on("close", () => {
        return reject(new Error("not found"));
      });
    });
  } catch (e) {
    console.error("Error reatriving activity:", e.message);
    return null;
  }
};

const updateActivity = async (id, data) => {
  if (!checkDb()) {
    return null;
  }
  try {
    return await new Promise((resolve, reject) => {
      const readlineInterface = getReadlineInterface();

      const activities = [];
      let updatedActivity;

      readlineInterface.on("line", (line) => {
        const activity = lineHandler(line, id, (activity) => {
          Object.keys(data).forEach((key) => {
            activity[key] = data[key];
          });
          return (updatedActivity = { ...activity });
        });
        activities.push(JSON.stringify(activity));
      });
      readlineInterface.on("close", () => {
        fs.writeFile(dbFile, activities.join("\n"), (error) => {
          if (error) {
            reject(null);
          }
          resolve(updatedActivity);
        });
      });
    });
  } catch (e) {
    console.error("Error updating activity:", e.message);
    return null;
  }
};

export default { add, getActivities, getActivity, updateActivity };
