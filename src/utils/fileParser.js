const fs = require('fs');
const readline = require('readline');
const { dbFile } = require('../../config/config');

const parseLine = async (dbFile, id, data) => {
    return await new Promise((resolve, reject) => {
        const readlineInterface = readline.createInterface({
            input: fs.createReadStream(dbFile),
            crlfDelay: Infinity
        });

        let activities = [];  
        let updatedActivity;

        readlineInterface.on('line', (line) => {
            try {
                const activity = JSON.parse(line); 
                if (activity.id == id) { 
                    if (data) {
                        Object.keys(data).forEach(key => {
                            activity[key] = data[key];
                        });
                        updatedActivity = activity;
                    } else {
                        resolve(activity);
                    }
                }
                activities.push(JSON.stringify(activity));
            } catch (error) {
                console.error('Parsing error:', error.message);
            }
        });
        readlineInterface.on('close', () => {
            if (updatedActivity) {
                fs.writeFileSync(dbFile, activities.join('\n'));
                resolve(updatedActivity);
            } else {
                return reject(new Error('activity not found')); 
            }
        });
    });
};

module.exports = parseLine;