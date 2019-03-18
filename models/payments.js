'use strict';
module.exports = (sequelize, DataTypes) => {
  const payments = sequelize.define('payments', {
    pay_type: DataTypes.INTEGER,
    driver_id: DataTypes.STRING,
    ride_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10,2),
    charge_dr: DataTypes.DECIMAL(10,2),
    charge_cr: DataTypes.DECIMAL(10,2),
    status: DataTypes.INTEGER
  }, {});
  payments.associate = function(models) {
    // associations can be defined here
    payments.belongsTo(models.riderequests, {
      foreignKey: 'ride_id',
      targetKey: 'id'
    });
    payments.belongsTo(models.drivers, {
      foreignKey: 'driver_id',
      targetKey: 'token'
    });
  };
  return payments;
};