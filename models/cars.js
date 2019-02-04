'use strict';
var SequelizeTokenify = require('sequelize-tokenify');
module.exports = (sequelize, DataTypes) => {
  const cars = sequelize.define('cars', {
    driver_id: DataTypes.STRING,
    model: DataTypes.STRING,
    model_year: DataTypes.INTEGER,
    code: DataTypes.STRING,
    plate_no: DataTypes.STRING,
    side_token: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});

  SequelizeTokenify.tokenify(cars, {
    field: 'side_token',
    length: 5,
    charset: 'hex'
  });

  cars.associate = function(models) {
    // sundenly the kings of king and lords of lord will come
    cars.belongsTo(models.drivers, {
      foreignKey: 'driver_id'
    });
  };
  return cars;
};