module.exports = {
  apps: [
    {
      name: 'todolist',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      env: {
        NODE_ENV: 'development',
        PORT: 8000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8001,
        MONGODB_URI: process.env.MONGODB_URI,
        MAIL_USER: process.env.MAIL_USER,
        MAIL_PASS: process.env.MAIL_PASS,
      },
    },
  ],
};
