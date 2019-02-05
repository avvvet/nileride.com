'use strict';
module.exports = (sequelize, DataTypes) => {
  const ratings = sequelize.define('ratings', {
    ride_id: DataTypes.INTEGER,
    driver_id: DataTypes.STRING,
    rating: DataTypes.INTEGER
  }, {});
  ratings.associate = function(models) {
    // associations can be defined here
  };
  return ratings;
};