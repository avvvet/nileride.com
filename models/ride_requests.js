'use strict';
module.exports = (sequelize, DataTypes) => {
  const ride_requests = sequelize.define('ride_requests', {
    user_id: DataTypes.INTEGER,
    driver_id: DataTypes.STRING,
    pickup_latlng: DataTypes.GEOMETRY('POINT'),
    dropoff_latlng: DataTypes.GEOMETRY('POINT'),
    route_distance: DataTypes.DECIMAL(10, 2),
    route_time: DataTypes.INTEGER,
    route_price: DataTypes.DECIMAL(10,2),
    status: DataTypes.INTEGER
  }, {});
  ride_requests.associate = function(models) {
    riderequests.belongsTo(models.drivers, {
      foreignKey: 'driver_id'
    });
    riderequests.hasOne(models.payments, {
      foreignKey: 'ride_id',
      sourceKey: 'id'
    });
  };
  return ride_requests;
};