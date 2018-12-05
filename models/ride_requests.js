'use strict';
module.exports = (sequelize, DataTypes) => {
  const ride_requests = sequelize.define('ride_requests', {
    user_id: DataTypes.INTEGER,
    driver_id: DataTypes.STRING,
    pickup_latlng: DataTypes.GEOMETRY('POINT'),
    dropoff_latlng: DataTypes.GEOMETRY('POINT'),
    route_distance: DataTypes.DECIMAL,
    route_time: DataTypes.INTEGER,
    route_price: DataTypes.DECIMAL,
    status: DataTypes.INTEGER
  }, {});
  ride_requests.associate = function(models) {
    // associations can be defined here
  };
  return ride_requests;
};