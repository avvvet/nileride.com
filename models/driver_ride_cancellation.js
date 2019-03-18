'use strict';
module.exports = (sequelize, DataTypes) => {
  const driver_ride_cancellation = sequelize.define('driver_ride_cancellation', {
    driver_id: DataTypes.STRING,
    request_id: DataTypes.INTEGER,
    reason: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  driver_ride_cancellation.associate = function(models) {
    // associations can be defined here
  };
  return driver_ride_cancellation;
};