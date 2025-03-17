import dotenv from 'dotenv';
dotenv.config();

//console.log('MAIL_USER:', process.env.MAIL_USER);
//console.log('MAIL_PASSWORD:', process.env.MAIL_PASS);

const config = {
  dbFile: 'activity.db',
  host: 'localhost',
  port: 8000,
  db: {
    connectionString: 'mongodb+srv://peruzzipaola84:RMgJ4uiib0gBF4x1@cluster0.eokvx.mongodb.net/todolist',
    //host: "localhost",
    //port: 27017,
    //name: "todolist",
  },
  mailConfig: {
    type: 'Basic',
    basic: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    },
  },
  accessTokenExpiration: 3600,
  refreshTokenExpiration: 86400,
};

export default config;
