import dotenv from 'dotenv';
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

dotenv.config({ path: envFile });

const config = {
  dbFile: 'activity.db',
  host: 'localhost',
  port: process.env.PORT || 8000,
  db: {
    connectionString: process.env.MONGODB_URI,
    //host: "localhost",
    //port: 27017,
    //name: "todolist",
  },
  mailConfig: {
    type: 'basic',
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
