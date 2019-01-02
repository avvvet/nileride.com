'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
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
    gender: DataTypes.STRING,
    currentLocation: DataTypes.GEOMETRY('POINT'),
    isOnline: DataTypes.BOOLEAN,
    verified: DataTypes.BOOLEAN,
    status: DataTypes.INTEGER
  }, {});
  users.associate = function(models) {
    users.hasMany(models.riderequests, {
      foreignKey: 'user_id'
    });
  };
  return users;
};