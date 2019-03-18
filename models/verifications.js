'use strict';
var SequelizeTokenify = require('sequelize-tokenify');
module.exports = (sequelize, DataTypes) => {
  const verifications = sequelize.define('verifications', {
    verify_type: DataTypes.STRING,
    user_type: DataTypes.STRING,
    email: DataTypes.STRING,
    verification_token: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});

  SequelizeTokenify.tokenify(verifications, {
    field: 'verification_token',
    length: 5,
    charset: 'numeric'

  });

  verifications.associate = function(models) {
    // associations can be defined here
  };
  return verifications;
};