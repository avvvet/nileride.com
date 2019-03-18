'use strict';
module.exports = (sequelize, DataTypes) => {
  const ratings = sequelize.define('ratings', {
    ride_id: DataTypes.INTEGER,
    driver_id: DataTypes.STRING,
    rating: DataTypes.INTEGER
  }, {});
  ratings.associate = function(models) {
    //all I trust is Jesus - Please father help me to success is this one
    ratings.belongsTo(models.drivers, {
      foreignKey: 'driver_id'
    });
    ratings.belongsTo(models.riderequests, {
      foreignKey: 'ride_id',
      targetKey: 'id'
    });
  };
  return ratings;
};