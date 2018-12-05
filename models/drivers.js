'use strict';
module.exports = (sequelize, DataTypes) => {
  const Drivers = sequelize.define('Drivers', {
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    plateNo: DataTypes.STRING
  }, {});
  Drivers.associate = function(models) {
    // associations can be defined here
  };
  return Drivers;
};