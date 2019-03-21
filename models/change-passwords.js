'use strict';
var SequelizeTokenify = require('sequelize-tokenify');
module.exports = (sequelize, DataTypes) => {
  const change_passwords = sequelize.define('change_passwords', {
    mobile: DataTypes.STRING,
    verification_token: DataTypes.STRING,
    status: DataTypes.STRING
  }, {});

  SequelizeTokenify.tokenify(change_passwords, {
    field: 'verification_token',
    length: 5,
    charset: 'numeric'
  });

  change_passwords.associate = function(models) {
    // associations can be defined here
  };
  return change_passwords;
};