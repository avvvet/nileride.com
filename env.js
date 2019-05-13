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
  MISSED_RIDE_DURATION: 12,
  NEAREST_DRIVER_RADIUS: 800,
  RIDE_PERCENTAGE: 0.19,
};
module.exports = env;