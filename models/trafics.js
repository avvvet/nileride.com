'use strict';
module.exports = (sequelize, DataTypes) => {
  const trafics = sequelize.define('trafics', {
    trafic_type: DataTypes.STRING
  }, {});
  trafics.associate = function(models) {
    // associations can be defined here
  };
  return trafics;
};