'use strict';
const validator = require('validator');

module.exports = (sequelize, DataTypes) => {
  const drivers = sequelize.define('drivers', {
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: "Email address must be valid"
        }
      }
    },
    password: DataTypes.STRING,
    token: DataTypes.STRING,
    mobile: DataTypes.STRING,
    plateNo: DataTypes.STRING,
    currentLocation: DataTypes.GEOMETRY('POINT'),
    isOnline: DataTypes.BOOLEAN,
    verified: DataTypes.BOOLEAN,
    isCarRegistered: DataTypes.BOOLEAN,
    isCarVerified: DataTypes.BOOLEAN,
    status: DataTypes.INTEGER
  }, {});
  drivers.associate = function(models) {
    // PSALMS 91
    drivers.hasMany(models.riderequests, {
      foreignKey: 'driver_id'
    });
    drivers.hasMany(models.payments, {
      foreignKey: 'driver_id'
    });
  };
  
  return drivers;
};