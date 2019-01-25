'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_ride_cancellation = sequelize.define('user_ride_cancellation', {
    user_id: DataTypes.STRING,
    request_id: DataTypes.INTEGER,
    reason: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {});
  user_ride_cancellation.associate = function(models) {
    // associations can be defined here
  };
  return user_ride_cancellation;
};