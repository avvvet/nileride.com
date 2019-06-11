'use strict';

const env = {
  DATABASE_NAME: "awet_ride",
  DATABASE_HOST: "localhost",
  DATABASE_USERNAME: "root",
  DATABASE_PASSWORD: "Awet_003994",
  DATABASE_DIALECT: "mysql",
  DATABASE_OPERATORSALIASES: 'Sequelize.Op',
  //NODE_ENV:'development',
  NODE_ENV:'production',
  EMAIL_CC_A: 'avvvet@gmail.com',
  EMAIL_CC_B: 'natimancloud@gmail.com',
  MISSED_RIDE_DURATION: 25,
  NEAREST_DRIVER_RADIUS: 700,
  RIDE_PERCENTAGE: 0.19,
  DRIVER_ONLINE_SINCE_HOUR : 120,
  DRIVER_ONLINE_SINCE_HOUR_RIDE_CONTROL : 720,
  PASSENGER_ONLINE_SINCE_DAY : 30,
};
module.exports = env;