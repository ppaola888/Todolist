import fs from "fs";
import config from "../../config/config.js";
const dbFile = config.dbFile;

const checkDb = () => {
  //console.log("Checking if file exists:", dbFile);
  return fs.existsSync(dbFile);
};
/*if (!fs.existsSync(dbFile)) {
        console.error('File not found!');
        throw new Error('File does not exists');
    }
    content = fs.readFileSync(dbFile, 'utf8');
    if (!content.length) {
        throw new Error('File does not exists');
    }
    return content;*/

export default checkDb;
