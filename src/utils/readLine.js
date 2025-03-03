import fs from "fs";
import readline from "readline";
import config from "../../config/config.js";
const dbFile = config.dbFile;

const getReadlineInterface = () => {
  return readline.createInterface({
    input: fs.createReadStream(dbFile),
    crlfDelay: Infinity,
  });
};

export default getReadlineInterface;
